# leetbrian

To complile, need to find/replace `assembly {` with `assembly ("memory-safe") {` in the ERC721A and sstore2 in node_modules folder because per 0xth0mas:

```
The last 50k of gas saving requires adding ("memory-safe") to the assembly blocks in ERC721A & SSTORE2 where they're missing, I don't see any unsafe memory operations in any of those blocks
```

ENV

```
SEPOLIA_PROVIDER
SEPOLIA_PRIVATE_KEY
GOERLI_PROVIDER
GOERLI_PRIVATE_KEY
ETHEREUM_PROVIDER
ETHEREUM_PRIVATE_KEY
ETHERSCAN_APIKEY
```

CMD

```
npm install
npm run <COMMAND>
```
