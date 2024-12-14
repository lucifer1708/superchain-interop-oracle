require('dotenv').config();
const OracleNode = require('./src/oracle');

async function main() {
    const config = {
        networks: {
            sepolia: process.env.SEPOLIA_RPC_URL,
            optimismSepolia: process.env.OP_SEPOLIA_RPC_URL
        },
        contracts: {
            sepolia: "0x9a6C16DbB82a5158Db462b2F48e887B8ae1Dfc07",
            optimismSepolia: "0xA4cC77Be2edC5CEeeF5771e2Fa03204aF2A6e141"

        }
    };

    console.log('Starting Oracle Node...');
    console.log('Config:', JSON.stringify(config, null, 2));

    const oracle = new OracleNode(config);
    await oracle.start();
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});