/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1337,
            },
            viaIR: true,
        },
    },
    networks: {
        hardhat: {
            blockGasLimit: 60000000,
        },
        mainnet: {
            url: process.env.ETHEREUM_PROVIDER || "http://127.0.0.1:8555",
            accounts: [process.env.ETHEREUM_PRIVATE_KEY],
            blockGasLimit: 60000000,
        },
        goerli: {
            url: process.env.GOERLI_PROVIDER || "http://127.0.0.1:8555",
            accounts: [process.env.GOERLI_PRIVATE_KEY],
            blockGasLimit: 60000000,
        },
        "base-goerli": {
            url: "https://goerli.base.org",
            accounts: [process.env.GOERLI_PRIVATE_KEY],
            gasPrice: 1000000000,
            blockGasLimit: 60000000,
        },
        "base-mainnet": {
            url: "https://mainnet.base.org",
            accounts: [process.env.GOERLI_PRIVATE_KEY],
            gasPrice: 1000000000,
            blockGasLimit: 60000000,
        },
    },
    etherscan: {
        apiKey: {
            goerli: process.env.ETHERSCAN_APIKEY,
            mainnet: process.env.ETHERSCAN_APIKEY,
            "base-goerli": process.env.BASESCAN_APIKEY,
        },
        customChains: [
            {
                network: "base-goerli",
                chainId: 84531,
                urls: {
                    apiURL: "https://api-goerli.basescan.org/api",
                    browserURL: "https://goerli.basescan.org",
                },
            },
        ],
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        gasPrice: 21,
        url: "http://localhost:8545",
    },
};
