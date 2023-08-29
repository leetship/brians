const { solidityKeccak256 } = require("ethers/lib/utils");

const path = require("path");
const fs = require("fs");

const utils = require("../scripts/utils");

const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

const { expect } = require("chai");

const TMP_DIR = "./test/brians";
const TMP_ASSETS_DIR = "./test/brians/assets";
if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR);
}
if (!fs.existsSync(TMP_ASSETS_DIR)) {
    fs.mkdirSync(TMP_ASSETS_DIR);
}

const LAYER_BACKGROUND = "background";
const LAYER_BRIAN = "brian";
const LAYER_EYES = "eyes";
const LAYER_UNDER = "under";
const LAYER_OVER = "over";
const LAYER_SPECIAL = "special";

const generateLeaf = (address, value) => {
    return Buffer.from(
        solidityKeccak256(["address", "uint256"], [address, value]).slice(2),
        "hex"
    );
};

describe("Functional Validation", function () {
    describe("Upon deployment", function () {
        it("Claim", async function () {
            const contractCodeName = "LeetBrian";
            const claimContractCodeName = "LeetBrianClaim";
            const contractName = "1337 Brians";
            const contractSymbol = "1337BRIAN";
            const contractSupply = 69;

            const traits = utils.fetchMockTraitsDataForBrian();

            const layerBackground = utils.prepLayer(
                TMP_ASSETS_DIR,
                traits,
                LAYER_BACKGROUND
            );
            const layerBrian = utils.prepLayer(
                TMP_ASSETS_DIR,
                traits,
                LAYER_BRIAN
            );
            const layerUnder = utils.prepLayer(
                TMP_ASSETS_DIR,
                traits,
                LAYER_UNDER
            );
            const layerEyes = utils.prepLayer(
                TMP_ASSETS_DIR,
                traits,
                LAYER_EYES
            );
            const layerOver = utils.prepLayer(
                TMP_ASSETS_DIR,
                traits,
                LAYER_OVER
            );
            const layerSpecial = utils.prepLayer(
                TMP_ASSETS_DIR,
                traits,
                LAYER_SPECIAL
            );

            const allLayers = [
                layerBackground,
                layerBrian,
                layerUnder,
                layerEyes,
                layerOver,
                layerSpecial,
            ];
            let rarities = [];
            for (let i = 0; i < allLayers.length; i++) {
                rarities.push(allLayers[i].rarities);
            }
            console.log(rarities);
            console.log("PREPARED LAYERS AND RARITIES");

            // DEPLOY CONTRACTS
            const leetContract = await (
                await ethers.getContractFactory(contractCodeName)
            ).deploy(contractName, contractSymbol, contractSupply);
            await leetContract.deployed();

            const claimContract = await (
                await ethers.getContractFactory(claimContractCodeName)
            ).deploy(leetContract.address);
            await claimContract.deployed();
            console.log("DEPLOYED CONTRACT:", leetContract.address);
            console.log("DEPLOYED CLAIM CONTRACT:", claimContract.address);

            // ADD TRAITS
            for (let i = 0; i < allLayers.length; i++) {
                await leetContract.addTraits(
                    i,
                    allLayers[i].traits,
                    allLayers[i].rarities
                );
            }
            console.log("ADDED TRAITS");

            // SET UP WHITELIST
            const [owner, addr1, addr2] = await ethers.getSigners();
            const whitelistedAddresses = [
                {
                    address: owner.address,
                    value: "69",
                },
                { address: addr1.address, value: "1" },
            ];
            const merkleTree = new MerkleTree(
                whitelistedAddresses.map(({ address, value }) =>
                    generateLeaf(address, value)
                ),
                keccak256,
                { sortPairs: true }
            );

            // ENABLE MINTING AND SETUP MERKLE ROOT
            await leetContract.setMintStatus(true);
            await claimContract.setWhitelist(merkleTree.getRoot());

            // TRANSFER EXISTING CONTRACT OWNER TO NEW CLAIM CONTRACT ADDRESS
            await leetContract.transferOwnership(claimContract.address);

            // CLAIM WITH MERKLE PROOF FOR ADDRESS 1
            const merkleProof1 = merkleTree.getHexProof(
                generateLeaf(addr1.address, "1")
            );

            // SHOULD FAIL BECAUSE OF WRONG VALUE PROOF
            await expect(
                claimContract
                    .connect(addr1)
                    .claim(
                        "1",
                        merkleTree.getHexProof(generateLeaf(addr1.address, "2"))
                    )
            ).to.be.revertedWithCustomError(claimContract, "NotOnWhitelist");

            // SHOULD FAIL BECAUSE OF WRONG ADDRESS PROOF
            await expect(
                claimContract
                    .connect(addr1)
                    .claim(
                        "1",
                        merkleTree.getHexProof(generateLeaf(owner.address, "1"))
                    )
            ).to.be.revertedWithCustomError(claimContract, "NotOnWhitelist");

            // SHOULD FAIL BECAUSE OF WRONG CLAIM VALUE
            await expect(
                claimContract
                    .connect(addr1)
                    .claim(
                        "69",
                        merkleTree.getHexProof(generateLeaf(addr1.address, "1"))
                    )
            ).to.be.revertedWithCustomError(claimContract, "NotOnWhitelist");

            // SHOULD SUCCEED
            await claimContract.connect(addr1).claim("1", merkleProof1);
            expect(await leetContract.totalSupply()).to.equal(1);

            // SHOULD FAIL BECAUSE ALREADY CLAIMED
            await expect(
                claimContract.connect(addr1).claim("1", merkleProof1)
            ).to.be.revertedWithCustomError(claimContract, "AlreadyClaimed");
        });
    });
});
