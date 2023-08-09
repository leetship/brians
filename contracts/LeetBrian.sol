//
// SPDX-License-Identifier: MIT
// 1337 Based Brians
// by hoanh.eth
//
pragma solidity ^0.8.17;

import "@0xsequence/sstore2/contracts/SSTORE2.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "solady/src/utils/LibString.sol";
import "solady/src/utils/Base64.sol";

import {ERC721A, IERC721A} from "erc721a/contracts/ERC721A.sol";
import {ERC721AQueryable} from "erc721a/contracts/extensions/ERC721AQueryable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

struct Trait {
    string name;
    address image;
}

struct Brian {
    uint256 background;
    uint256 body;
    uint256 under;
    uint256 eyes;
    uint256 over;
    uint256 special;
}

contract LeetBrian is ERC721A, ERC721AQueryable, Ownable {
    uint256 public immutable supply;

    bool public isOpen = false;

    bytes32 private _merkleRoot;
    bytes32 private _raritiesHash;

    Trait[][6] private _traits;

    mapping(bytes32 => bool) private _combo;
    mapping(uint256 => Brian) private _registry;

    error MintClose();
    error MintOut();
    error InvalidRarities();
    error InvalidToken();
    error NotEqualLength();

    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        bytes32 raritiesHash
    ) ERC721A(name, symbol) {
        supply = totalSupply;

        _raritiesHash = raritiesHash;
    }

    /**
     * @notice Set minting status
     */
    function setMintStatus(bool state) external onlyOwner {
        isOpen = state;
    }

    /**
     * @notice Check if an address is on whitelist
     */
    function checkWhitelist(
        address addr,
        bytes32[] calldata merkleProof
    ) public view returns (bool) {
        return
            MerkleProof.verify(
                merkleProof,
                _merkleRoot,
                keccak256(abi.encodePacked(addr))
            );
    }

    /**
     * @notice Set whitelist using merkle proof
     */
    function setWhitelist(bytes32 newMerkleRoot) external onlyOwner {
        _merkleRoot = newMerkleRoot;
    }

    /**
     * @notice Add traits
     */
    function addTraits(
        uint8 layer,
        string[] calldata names,
        bytes[] calldata images
    ) public onlyOwner {
        if (names.length != images.length) revert NotEqualLength();

        uint256 i = 0;
        Trait memory trait;
        do {
            trait.name = names[i];
            trait.image = SSTORE2.write(images[i]);
            _traits[layer].push(trait);
            unchecked {
                ++i;
            }
        } while (i < names.length);
    }

    /**
     * @notice Mint function
     */
    function mint(uint256 amount, uint256[][] calldata rarities) public {
        if (!isOpen) revert MintClose();
        if (keccak256(abi.encode(rarities)) != _raritiesHash) {
            revert InvalidRarities();
        }
        uint256 minted = _totalMinted();
        unchecked {
            if ((minted + amount) > supply) revert MintOut();
        }

        _setTraitsCombination(minted, amount, rarities);
        _safeMint(msg.sender, amount, "");
    }

    /**
     * @notice Build metadata and assemble the corresponding token info
     */
    function tokenURI(
        uint256 tokenID
    )
        public
        view
        virtual
        override(ERC721A, IERC721A)
        returns (string memory metadata)
    {
        if (!_exists(tokenID)) revert InvalidToken();

        Brian memory brian = _registry[tokenID];
        bytes memory json = abi.encodePacked(
            '{"name": "1337 Based Brian #',
            LibString.toString(tokenID),
            '", "description":"',
            "1337 Based Brians",
            '","image":"data:image/svg+xml;base64,',
            _getTraitImage(brian),
            '",',
            '"attributes": [',
            _getTraitAttributes(brian),
            "]}"
        );

        return string(abi.encodePacked("data:application/json,", json));
    }

    /**
     * @notice Get trait image
     */
    function _getTraitImage(
        Brian memory brian
    ) internal view returns (string memory image) {
        return
            Base64.encode(
                abi.encodePacked(
                    '<svg width="100%" height="100%" viewBox="0 0 20000 20000" xmlns="http://www.w3.org/2000/svg">',
                    "<style>svg{background-color:transparent;background-image:",
                    _getTraitImageData(_traits[5][brian.special].image),
                    ",",
                    _getTraitImageData(_traits[4][brian.over].image),
                    ",",
                    _getTraitImageData(_traits[3][brian.eyes].image),
                    ",",
                    _getTraitImageData(_traits[2][brian.under].image),
                    ",",
                    _getTraitImageData(_traits[1][brian.body].image),
                    ",",
                    _getTraitImageData(_traits[0][brian.background].image),
                    ";background-repeat:no-repeat;background-size:contain;background-position:center;image-rendering:-webkit-optimize-contrast;-ms-interpolation-mode:nearest-neighbor;image-rendering:-moz-crisp-edges;image-rendering:pixelated;}</style></svg>"
                )
            );
    }

    /**
     * @notice Get trait image at address
     */
    function _getTraitImageData(
        address image
    ) private view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "url(data:image/png;base64,",
                    Base64.encode(SSTORE2.read(image)),
                    ")"
                )
            );
    }

    /**
     * @notice Get trait attributes
     */
    function _getTraitAttributes(
        Brian memory brian
    ) internal view returns (string memory trait) {
        return
            string.concat(
                _getTraitMetadata(
                    "background",
                    _traits[0][brian.background].name
                ),
                ",",
                _getTraitMetadata("brian", _traits[1][brian.body].name),
                ",",
                _getTraitMetadata("under", _traits[2][brian.under].name),
                ",",
                _getTraitMetadata("eyes", _traits[3][brian.eyes].name),
                ",",
                _getTraitMetadata("over", _traits[4][brian.over].name),
                ",",
                _getTraitMetadata("special", _traits[5][brian.special].name)
            );
    }

    /**
     * @notice Get trait metadata
     */
    function _getTraitMetadata(
        string memory key,
        string memory value
    ) internal pure returns (string memory trait) {
        return
            string.concat('{"trait_type":"', key, '","value": "', value, '"}');
    }

    /**
     * @notice Get an unique DNA for a given token ID
     */
    function _setTraitsCombination(
        uint256 tokenID,
        uint256 amount,
        uint256[][] calldata rarities
    ) private {
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(block.difficulty, tokenID, address(this))
            )
        );
        uint256 current = tokenID;
        bytes32 combination;
        Brian memory brian;
        while (true) {
            brian.background = _getRandomTraitIndex(rarities[0], seed);
            brian.body = _getRandomTraitIndex(rarities[1], seed >> 8);
            brian.under = _getRandomTraitIndex(rarities[2], seed >> 16);
            brian.eyes = _getRandomTraitIndex(rarities[3], seed >> 32);
            brian.over = _getRandomTraitIndex(rarities[4], seed >> 40);
            brian.special = _getRandomTraitIndex(rarities[5], seed >> 48);

            combination = keccak256(abi.encode(brian));
            if (!_combo[combination]) {
                _combo[combination] = true;
                _registry[current] = brian;

                unchecked {
                    ++current;
                    if (current > (tokenID + amount)) break;
                }
            }
            seed = uint256(keccak256(abi.encode(seed)));
        }
    }

    /**
     * @notice Get random trait index based on seed
     * Inspired by Anonymice (0xbad6186e92002e312078b5a1dafd5ddf63d3f731)
     */
    function _getRandomTraitIndex(
        uint256[] calldata rarities,
        uint256 seed
    ) private pure returns (uint256 index) {
        uint256 rand = seed % 10000;
        uint256 lowerBound;
        uint256 upperBound;
        uint256 percentage;

        for (uint256 i; i < rarities.length; ) {
            percentage = rarities[i];
            upperBound = lowerBound + percentage;

            if (rand >= lowerBound && rand < upperBound) {
                return i;
            }

            unchecked {
                lowerBound += percentage;
                ++i;
            }
        }
        revert();
    }
}
