//
// SPDX-License-Identifier: MIT
// Contract for 1337 Brians on Base
// Written by hoanh.eth
// Gas optimizations by 0xth0mas.eth
//
pragma solidity ^0.8.20;

import "@0xsequence/sstore2/contracts/SSTORE2.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "solady/src/utils/LibString.sol";
import "solady/src/utils/Base64.sol";

import {ERC721A, IERC721A} from "erc721a/contracts/ERC721A.sol";
import {ERC721AQueryable} from "erc721a/contracts/extensions/ERC721AQueryable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

struct Trait {
    address image;
    string name;
}

struct Payload {
    string name;
    bytes image;
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

    mapping(uint256 => uint256) private _traitCounts;
    mapping(uint256 => mapping(uint256 => Trait)) private _traits;
    uint16[][6] private _traitRarities;

    mapping(uint256 => uint256) private _combo;
    mapping(uint256 => uint256) private _registry;
    mapping(address => bool) _minted;

    error MintClose();
    error MintOut();
    error InvalidToken();
    error NotOnWhitelist();
    error MaxMintPerAddress();

    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply
    ) ERC721A(name, symbol) {
        supply = totalSupply;
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
            MerkleProof.verifyCalldata(
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
        Payload[] calldata payload,
        uint16[] calldata traitRarities
    ) public onlyOwner {
        if (payload.length != traitRarities.length) revert();
        uint256 traitIndex = _traitCounts[layer];
        unchecked {
            _traitCounts[layer] += payload.length;
        }

        for (uint256 i; i < payload.length; ) {
            Trait storage trait = _traits[layer][traitIndex];
            trait.image = SSTORE2.write(payload[i].image);
            trait.name = payload[i].name;
            _traitRarities[layer].push(traitRarities[i]);

            unchecked {
                ++i;
                ++traitIndex;
            }
        }
    }

    /**
     * @notice Whilelist mint
     */
    function whitelistMint(bytes32[] calldata merkleProof) public {
        if (!checkWhitelist(msg.sender, merkleProof)) revert NotOnWhitelist();
        if (_minted[msg.sender]) revert MaxMintPerAddress();

        _mint(1, msg.sender);
    }

    /**
     * @notice Owner mint
     */
    function ownerMint(uint256 amount) public onlyOwner {
        _mint(amount, msg.sender);
    }

    /**
     * @notice Airdrop to an address
     */
    function airdrop(uint256 amount, address to) public onlyOwner {
        _mint(amount, to);
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

        Brian memory brian = _getTraits(tokenID);
        bytes memory json = abi.encodePacked(
            '{"name": "1337 Brian #',
            LibString.toString(tokenID),
            '", "description":"',
            "1337 Brians is a collection of 8,453 pixel art bald brians, deployed fully onchain with a public domain license. Community crafted for Onchain Summer, these based brians are the latest from the 1337 hackers that brought you 1337 Skulls and more. Stay based and get 1337 pilled at 1337skulls.xyz.",
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
     * @notice Helper mint function
     */
    function _mint(uint256 amount, address to) private {
        if (!isOpen) revert MintClose();
        uint256 minted = _totalMinted();
        unchecked {
            if ((minted + amount) > supply) revert MintOut();
        }

        _setTraitsCombination(minted, amount);
        _safeMint(to, amount, "");
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
                    _traits[0][brian.background].name,
                    false
                ),
                ",",
                _getTraitMetadata("brian", _traits[1][brian.body].name, false),
                _getTraitMetadata("under", _traits[2][brian.under].name, true),
                _getTraitMetadata("eyes", _traits[3][brian.eyes].name, true),
                _getTraitMetadata("over", _traits[4][brian.over].name, true),
                _getTraitMetadata(
                    "special",
                    _traits[5][brian.special].name,
                    true
                )
            );
    }

    /**
     * @notice Get trait metadata
     */
    function _getTraitMetadata(
        string memory key,
        string memory value,
        bool withComma
    ) internal pure returns (string memory trait) {
        if (
            keccak256(abi.encodePacked(value)) ==
            keccak256(abi.encodePacked("none"))
        ) {
            return "";
        }
        if (withComma) {
            return
                string.concat(
                    ',{"trait_type":"',
                    key,
                    '","value": "',
                    value,
                    '"}'
                );
        }
        return
            string.concat('{"trait_type":"', key, '","value": "', value, '"}');
    }

    /**
     * @notice Get an unique DNA for a given token ID
     */
    function _setTraitsCombination(uint256 tokenID, uint256 amount) private {
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(block.prevrandao, tokenID, address(this))
            )
        );

        uint256 current = tokenID;
        uint256 combination;
        uint16[] memory backgroundRarities = _traitRarities[0];
        uint16[] memory bodyRarities = _traitRarities[1];
        uint16[] memory underRarities = _traitRarities[2];
        uint16[] memory eyesRarities = _traitRarities[3];
        uint16[] memory overRarities = _traitRarities[4];
        uint16[] memory specialRarities = _traitRarities[5];

        while (true) {
            combination = _getRandomTraitIndex(backgroundRarities, seed);
            combination |= (_getRandomTraitIndex(bodyRarities, seed >> 16) <<
                8);
            combination |= (_getRandomTraitIndex(underRarities, seed >> 32) <<
                16);
            combination |= (_getRandomTraitIndex(eyesRarities, seed >> 48) <<
                24);
            combination |= (_getRandomTraitIndex(overRarities, seed >> 64) <<
                32);
            combination |= (_getRandomTraitIndex(specialRarities, seed >> 80) <<
                40);

            if (_combo[combination] == 0) {
                _combo[combination] = 1;
                _storeTraits(current, combination);

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
        uint16[] memory rarities,
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
                lowerBound = upperBound;
                ++i;
            }
        }
        revert();
    }

    /**
     * @notice Store traits for a given token ID
     */
    function _storeTraits(uint256 tokenId, uint256 traitCombination) internal {
        uint256 tokenTraitBucket = tokenId / 4;
        uint256 tokenTraitSlot = tokenId % 4;
        uint256 traitMask = not(0xFFFFFFFFFFFFFFFF << (64 * tokenTraitSlot));
        _registry[tokenTraitBucket] =
            (_registry[tokenTraitBucket] & traitMask) |
            (traitCombination << (64 * tokenTraitSlot));
    }

    /**
     * @notice Get traits for a given token ID
     */
    function _getTraits(
        uint256 tokenId
    ) internal view returns (Brian memory brian) {
        uint256 tokenTraitBucket = tokenId / 4;
        uint256 tokenTraitSlot = tokenId % 4;
        uint256 traitMask = 0xFFFFFFFFFFFFFFFF << (64 * tokenTraitSlot);
        uint256 traitCombination = (_registry[tokenTraitBucket] & traitMask) >>
            (64 * tokenTraitSlot);
        traitMask = 0xFF;

        brian.background = traitCombination & traitMask;
        traitCombination >>= 8;
        brian.body = traitCombination & traitMask;
        traitCombination >>= 8;
        brian.under = traitCombination & traitMask;
        traitCombination >>= 8;
        brian.eyes = traitCombination & traitMask;
        traitCombination >>= 8;
        brian.over = traitCombination & traitMask;
        traitCombination >>= 8;
        brian.special = traitCombination;
    }

    function not(uint256 val) internal pure returns (uint256 notval) {
        assembly ("memory-safe") {
            notval := not(val)
        }
    }
}
