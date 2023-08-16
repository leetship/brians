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

const LAYERS = [
    LAYER_BACKGROUND,
    LAYER_BRIAN,
    LAYER_EYES,
    LAYER_UNDER,
    LAYER_OVER,
    LAYER_SPECIAL,
];

describe("Functional Validation", function () {
    describe("Upon deployment", function () {
        it("Before mint", async function () {
            const contractCodeName = "LeetBrian";
            const fixedContractCodeName = "LeetBrianMint";
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

            const fixedLeetContract = await (
                await ethers.getContractFactory(fixedContractCodeName)
            ).deploy(leetContract.address);
            await fixedLeetContract.deployed();
            console.log("DEPLOYED CONTRACT:", leetContract.address);
            console.log("DEPLOYED FIXED CONTRACT:", fixedLeetContract.address);

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
            const whitelistedAddresses = [owner.address, addr1.address];
            const merkleTree = new MerkleTree(
                whitelistedAddresses.map((addr) => keccak256(addr)),
                keccak256,
                { sortPairs: true }
            );

            // ENABLE MINTING AND SETUP MERKLE ROOT
            await leetContract.setMintStatus(true);
            await leetContract.setWhitelist(merkleTree.getRoot());

            // MINT WITH MERKLE PROOF FOR ADDRESS 1
            const merkleProof1 = merkleTree.getHexProof(
                keccak256(addr1.address)
            );
            await leetContract.connect(addr1).whitelistMint(merkleProof1);
            expect(await leetContract.totalSupply()).to.equal(1);

            // ADDRESS 1 WITH MERKLE PROOF 2 SHOULD FAIL
            const merkleProof2 = merkleTree.getHexProof(
                keccak256(addr2.address)
            );
            await expect(
                leetContract.connect(addr1).whitelistMint(merkleProof2)
            ).to.be.revertedWithCustomError(leetContract, "NotOnWhitelist");

            // ONLY ALLOW ONCE PER ADDRESS
            // SHOULD HAVE FAILED AT THIS STEP HERE!!!
            leetContract.connect(addr1).whitelistMint(merkleProof1);

            // OWNER MINT 10
            await leetContract.ownerMint(10);
            expect(await leetContract.totalSupply()).to.equal(12);

            // TRANSFER EXISTING CONTRACT OWNER TO NEW FIXED CONTRACT ADDRESS
            await leetContract.transferOwnership(fixedLeetContract.address);
            console.log(await leetContract.owner());
            await fixedLeetContract.connect(addr1).whitelistMint(merkleProof1);
            expect(await leetContract.totalSupply()).to.equal(13);

            // SHOULD NOW FAIL FOR YOMO MINT HERE
            await expect(
                fixedLeetContract.connect(addr1).whitelistMint(merkleProof1)
            ).to.be.revertedWithCustomError(
                fixedLeetContract,
                "MaxMintPerAddress"
            );

            // AS WELL AS INVALID MERKLE PROOF
            await expect(
                fixedLeetContract.connect(addr1).whitelistMint(merkleProof2)
            ).to.be.revertedWithCustomError(
                fixedLeetContract,
                "NotOnWhitelist"
            );

            // WRITE FILES LOCALLY AND CALCULATE DISTRIBUTION
            // let distribution = {};
            // for (let i = 0; i < LAYERS.length; i++) {
            //     distribution[LAYERS[i]] = {};
            // }
            // for (let i = 0; i < 13; i++) {
            //     const tokenURI = await leetContract.tokenURI(i);
            //     const payload = JSON.parse(
            //         tokenURI.split("data:application/json,")[1]
            //     );
            //     console.log(payload.attributes);
            //     for (let i = 0; i < payload.attributes.length; i++) {
            //         const traitType = payload.attributes[i].trait_type;
            //         const traitValue = payload.attributes[i].value;
            //         if (traitValue in distribution[traitType]) {
            //             distribution[traitType][traitValue] += 1;
            //         } else {
            //             distribution[traitType][traitValue] = 1;
            //         }
            //     }
            //     fs.writeFileSync(
            //         path.join(TMP_DIR, `${i}.svg`),
            //         atob(payload.image.split("data:image/svg+xml;base64,")[1])
            //     );
            // }
            // console.log(distribution);
        });
    });
});
