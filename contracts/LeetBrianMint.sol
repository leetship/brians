//
// SPDX-License-Identifier: MIT
// Fixed mint contract for 1337 Brians on Base
// Written by hoanh.eth
//
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "./LeetBrian.sol";

contract LeetBrianMint is Ownable {
    LeetBrian public leetBrian;

    bytes32 private _merkleRoot;

    mapping(address => bool) _minted;

    error NotOnWhitelist();
    error MaxMintPerAddress();

    constructor(address addr) {
        leetBrian = LeetBrian(addr);
    }

    function whitelistMint(bytes32[] calldata merkleProof) public {
        if (!checkWhitelist(msg.sender, merkleProof)) revert NotOnWhitelist();
        if (_minted[msg.sender]) revert MaxMintPerAddress();

        leetBrian.airdrop(1, msg.sender);
        _minted[msg.sender] = true;
    }

    function setMintStatus(bool state) external onlyOwner {
        leetBrian.setMintStatus(state);
    }

    function airdrop(uint256 amount, address to) public onlyOwner {
        leetBrian.airdrop(amount, to);
    }

    function checkWhitelist(
        address addr,
        bytes32[] calldata merkleProof
    ) public view returns (bool) {
        return leetBrian.checkWhitelist(addr, merkleProof);
    }

    function setWhitelist(bytes32 newMerkleRoot) external onlyOwner {
        leetBrian.setWhitelist(newMerkleRoot);
    }

    function transferLeetBrianOwnership(address to) public onlyOwner {
        leetBrian.transferOwnership(to);
    }
}
