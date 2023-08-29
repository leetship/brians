const fs = require("fs");

const utils = require("./utils");

async function main() {
    // GET CONTRACT
    const contractCodeName = "LeetBrian";
    const contractAddress = "0x5519dc53d698ce6b9eefc71efc454e4b269307b9";
    const LeetContract = await ethers.getContractFactory(contractCodeName);
    const leetContract = LeetContract.attach(contractAddress);
    console.log(await leetContract.name());
    console.log(await leetContract.totalSupply());

    const snapshot = JSON.parse(
        fs.readFileSync("./assets/snapshot_082823.json")
    );

    for (let i = 0; i < snapshot.length; i++) {
        const address = snapshot[i].address;
        const amount = snapshot[i].amount;
        if (amount === 420) {
            for (let i = 0; i < 4; i++) {
                console.log(50, address);
                await leetContract.airdrop(50, address, { gasLimit: 28500000 });
            }
            console.log(20, address);
            await leetContract.airdrop(50, address, { gasLimit: 28500000 });
        } else {
            console.log(amount, address);
            await leetContract.airdrop(50, address, { gasLimit: 28500000 });
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
