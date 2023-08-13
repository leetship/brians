const fs = require("fs");

async function main() {
    // GET CONTRACT
    // const contractCodeName = "LeetBrian";
    // const contractAddress = "0xfe558d36edc45d9e852f7dbc6f1f8fcd1a4a6611";
    // const LeetContract = await ethers.getContractFactory(contractCodeName);
    // const leetContract = LeetContract.attach(contractAddress);
    // console.log(await leetContract.name());

    // const supply = await leetContract.totalSupply();
    // console.log(await leetContract.totalSupply());

    // TOKENURI
    // let results = [];
    // for (let i = 0; i < supply; i++) {
    //     const tokenURI = await leetContract.tokenURI(i);
    //     const payload = JSON.parse(tokenURI.split("data:application/json,")[1]);
    //     console.log(payload);
    //     results.push(payload);
    // }
    // fs.writeFileSync("./assets/test.json", JSON.stringify(results));

    // ANALYTICS
    let traitsDistribution = {};
    let traitsCount = {};
    let raw = fs.readFileSync("./assets/test.json");
    let tokens = JSON.parse(raw);
    for (let i = 0; i < tokens.length; i++) {
        const count = tokens[i].attributes.length;
        if (!(count in traitsCount)) {
            traitsCount[count] = 0;
        }
        for (let j = 0; j < tokens[i].attributes.length; j++) {
            const traitType = tokens[i].attributes[j].trait_type;
            const traitValue = tokens[i].attributes[j].value;
            if (!(traitType in traitsDistribution)) {
                traitsDistribution[traitType] = {};
            }

            if (!(traitValue in traitsDistribution[traitType])) {
                traitsDistribution[traitType][traitValue] = 0;
            }
            traitsDistribution[traitType][traitValue] += 1;
        }
        traitsCount[count] += 1;
    }
    console.log(traitsDistribution);
    console.log(traitsCount);

    // MINT
    // const rarities = [
    //     [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000],
    //     [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000],
    // ];
    // const MINT_AMOUNTS = 6;
    // await leetContract.ownerMint(MINT_AMOUNTS, rarities, { gasLimit: 2000000 });
    // console.log("MINTED", MINT_AMOUNTS);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
