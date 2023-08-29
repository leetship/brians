//
// SPDX-License-Identifier: MIT
// Claim airdrop contract for 1337 Brians on Base
// Written by hoanh.eth
//
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "./LeetBrian.sol";

contract LeetBrianClaim is Ownable {
    LeetBrian public leetBrian;

    bytes32 merkleRoot;
    mapping(address => bool) public claimed;

    error NotOnWhitelist();
    error AlreadyClaimed();

    constructor(address addr) {
        leetBrian = LeetBrian(addr);
    }

    /**
     * @notice Claim tokens if address is on whitelist
     */
    function claim(uint256 amount, bytes32[] calldata proof) external {
        if (claimed[msg.sender]) revert AlreadyClaimed();

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        bool isValid = MerkleProof.verify(proof, merkleRoot, leaf);
        if (!isValid) revert NotOnWhitelist();

        claimed[msg.sender] = true;
        leetBrian.airdrop(amount, msg.sender);
    }

    function setWhitelist(bytes32 newMerkleRoot) external onlyOwner {
        merkleRoot = newMerkleRoot;
    }

    function transferLeetBrianOwnership(address to) public onlyOwner {
        leetBrian.transferOwnership(to);
    }
}
