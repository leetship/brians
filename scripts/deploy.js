const path = require("path");
const fs = require("fs");

const utils = require("./utils");

const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

const hre = require("hardhat");

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

const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

async function main() {
    // SET DEPLOYMENT METADATA
    const contractCodeName = "LeetBrian";
    const contractName = "PUSSCODE";
    const contractSymbol = "PUSSCODE";
    const contractSupply = 69;

    // PREPARE LAYERS AND RARITIES
    const traits = await utils.fetchTraitsData(
        "https://1337py.vercel.app/brian/traits"
    );
    const layerBackground = utils.prepLayer(
        TMP_ASSETS_DIR,
        traits,
        LAYER_BACKGROUND
    );
    const layerBrian = utils.prepLayer(TMP_ASSETS_DIR, traits, LAYER_BRIAN);
    const layerUnder = utils.prepLayer(TMP_ASSETS_DIR, traits, LAYER_UNDER);
    const layerEyes = utils.prepLayer(TMP_ASSETS_DIR, traits, LAYER_EYES);
    const layerOver = utils.prepLayer(TMP_ASSETS_DIR, traits, LAYER_OVER);
    const layerSpecial = utils.prepLayer(TMP_ASSETS_DIR, traits, LAYER_SPECIAL);

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
    ).deploy(contractName, contractSymbol, contractSupply, raritiesHash);
    await leetContract.deployed();
    console.log("DEPLOYED CONTRACT", leetContract.address);

    // ADD TRAITS
    for (let i = 0; i < allLayers.length; i++) {
        console.log(
            `ADDING TRAITS AT LAYER ${i} FOR A TOTAL OF ${allLayers[i].traits.length} TRAITS`
        );

        await leetContract.addTraits(i, allLayers[i].traits, {
            gasLimit: 60000000,
        });
    }
    console.log("ADDED ALL TRAITS");

    // VERYFI ON BASESCAN
    if (hre.network.name == "base-goerli") {
        await delay(30000);

        await hre.run("verify:verify", {
            address: leetContract.address,
            constructorArguments: [
                contractName,
                contractSymbol,
                contractSupply,
                raritiesHash,
            ],
        });
        console.log("VERIFED ON BASESCAN");
    }

    // TEST MINT LOCALLY
    if (hre.network.name == "localhost") {
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
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
