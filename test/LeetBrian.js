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

            const raritiesHash = ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(["uint256[][]"], [rarities])
            );

            // DEPLOY CONTRACT
            const leetContract = await (
                await ethers.getContractFactory(contractCodeName)
            ).deploy(
                contractName,
                contractSymbol,
                contractSupply,
                raritiesHash
            );
            await leetContract.deployed();
            console.log("DEPLOYED CONTRACT", leetContract.address);

            // ADD TRAITS
            for (let i = 0; i < allLayers.length; i++) {
                await leetContract.addTraits(i, allLayers[i].traits);
            }
            console.log("ADDED TRAITS");

            // TEST MINT
            await leetContract.setMintStatus(true);
            const MINT_AMOUNTS = 33;
            await leetContract.ownerMint(MINT_AMOUNTS, rarities);
            console.log("MINTED", MINT_AMOUNTS);

            let distribution = {};
            for (let i = 0; i < LAYERS.length; i++) {
                distribution[LAYERS[i]] = {};
            }
            for (let i = 0; i < MINT_AMOUNTS; i++) {
                const tokenURI = await leetContract.tokenURI(i);
                const payload = JSON.parse(
                    tokenURI.split("data:application/json,")[1]
                );
                console.log(payload.attributes);
                for (let i = 0; i < payload.attributes.length; i++) {
                    const traitType = payload.attributes[i].trait_type;
                    const traitValue = payload.attributes[i].value;
                    if (traitValue in distribution[traitType]) {
                        distribution[traitType][traitValue] += 1;
                    } else {
                        distribution[traitType][traitValue] = 1;
                    }
                }
                fs.writeFileSync(
                    path.join(TMP_DIR, `${i}.svg`),
                    atob(payload.image.split("data:image/svg+xml;base64,")[1])
                );
            }
            console.log(distribution);
        });
    });
});
