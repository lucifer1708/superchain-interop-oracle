// scripts/deploy.js
const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy on Ethereum L1
    const SuperchainOracle = await ethers.getContractFactory("SuperchainOracle");
    const ethOracle = await SuperchainOracle.deploy(
        "AXELAR_GATEWAY_ADDRESS_ETH"
    );
    await ethOracle.deployed();
    console.log("Ethereum Oracle deployed to:", ethOracle.address);

    // Deploy on Optimism
    const optimismOracle = await SuperchainOracle.deploy(
        "AXELAR_GATEWAY_ADDRESS_OP"
    );
    await optimismOracle.deployed();
    console.log("Optimism Oracle deployed to:", optimismOracle.address);

    // Initialize supported assets
    const assets = ["ethereum", "bitcoin"];
    for (const asset of assets) {
        await ethOracle.addAsset(asset);
        await optimismOracle.addAsset(asset);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });