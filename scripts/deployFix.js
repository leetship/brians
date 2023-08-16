const hre = require("hardhat");

const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

async function main() {
    const contractCodeName = "LeetBrianMint";
    const originalContract = "0x5519dC53D698cE6b9EeFc71EFC454E4B269307B9";

    // DEPLOY CONTRACT
    const leetContract = await (
        await ethers.getContractFactory(contractCodeName)
    ).deploy(originalContract);
    await leetContract.deployed();
    console.log("DEPLOYED CONTRACT", leetContract.address);

    // VERYFI ON BASESCAN
    if (
        hre.network.name == "base-goerli" ||
        hre.network.name == "base-mainnet"
    ) {
        console.log("VERIFYING ON BASESCAN");
        await delay(30000);

        await hre.run("verify:verify", {
            address: leetContract.address,
            constructorArguments: [originalContract],
        });
        console.log("VERIFED ON BASESCAN");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
