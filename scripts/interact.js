async function main() {
    // GET CONTRACT
    const contractCodeName = "LeetBrian";
    const contractAddress = "0x24a644d24d7112f251644beb5cfaefeb362967f8";
    const LeetContract = await ethers.getContractFactory(contractCodeName);
    const leetContract = LeetContract.attach(contractAddress);
    console.log(await leetContract.name());
    console.log(await leetContract.totalSupply());

    // TOKENURI
    const tokenURI = await leetContract.tokenURI(0);
    const payload = JSON.parse(tokenURI.split("data:application/json,")[1]);
    console.log(payload);

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
