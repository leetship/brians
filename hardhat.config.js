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
            evmVersion: "paris",
            viaIR: true,
        },
    },
    networks: {
        hardhat: {
            blockGasLimit: 60000000,
        },
    },
    etherscan: {
        apiKey: {
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
