// src/oracle/index.js
require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const winston = require('winston');

class OracleNode {
    constructor(config) {
        this.providers = new Map();
        this.contracts = new Map();
        this.logger = this.setupLogger();
        
        this.setupProviders(config.networks);
        this.setupContracts(config.contracts);
    }

    setupLogger() {
        return winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.File({ filename: 'error.log', level: 'error' }),
                new winston.transports.File({ filename: 'combined.log' }),
                new winston.transports.Console()
            ]
        });
    }

    setupProviders(networks) {
        for (const [name, url] of Object.entries(networks)) {
            try {
                const provider = new ethers.providers.JsonRpcProvider(url);
                this.providers.set(name, provider);
                this.logger.info(`Provider setup for ${name}`);
            } catch (error) {
                this.logger.error(`Failed to setup provider for ${name}: ${error.message}`);
            }
        }
    }

    setupContracts(contracts) {
        for (const [network, address] of Object.entries(contracts)) {
            try {
                const provider = this.providers.get(network);
                if (!provider) {
                    throw new Error(`No provider found for network ${network}`);
                }

                const wallet = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, provider);
                
                // Basic ABI for testing
                const OracleABI = [
                    "function updatePrice(string memory asset, uint256 price, string memory source) external",
                    "function getPrice(string memory asset) external view returns (uint256, uint256, string memory)"
                ];

                const contract = new ethers.Contract(address, OracleABI, wallet);
                this.contracts.set(network, contract);
                this.logger.info(`Contract setup for ${network} at ${address}`);
            } catch (error) {
                this.logger.error(`Failed to setup contract for ${network}: ${error.message}`);
            }
        }
    }

    async fetchPrice(asset) {
        try {
            const response = await axios.get(
                `https://api.coingecko.com/api/v3/simple/price?ids=${asset}&vs_currencies=usd`
            );
            
            const price = response.data[asset].usd;
            // Convert price to wei format (8 decimals)
            const priceInWei = ethers.utils.parseUnits(price.toString(), 8);
            
            this.logger.info(`Fetched price for ${asset}: $${price} (${priceInWei.toString()} wei)`);
            return priceInWei;
        } catch (error) {
            this.logger.error(`Error fetching price for ${asset}: ${error.message}`);
            throw error;
        }
    }

    async updatePrice(network, asset) {
        const contract = this.contracts.get(network);
        if (!contract) {
            this.logger.error(`No contract found for network ${network}`);
            return;
        }

        try {
            const price = await this.fetchPrice(asset);
            this.logger.info(`Attempting to update price for ${asset} on ${network} with price ${price.toString()}`);
            
            const tx = await contract.updatePrice(asset, price, "CoinGecko");
            this.logger.info(`Transaction sent: ${tx.hash}`);
            
            const receipt = await tx.wait();
            this.logger.info(
                `Price updated for ${asset} on ${network}: ${price.toString()} (tx: ${receipt.transactionHash})`
            );
        } catch (error) {
            this.logger.error(
                `Error updating price for ${asset} on ${network}: ${error.message}`
            );
        }
    }

    async start() {
        this.logger.info('Oracle Node starting...');
        
        // Initial update
        for (const network of this.contracts.keys()) {
            await this.updatePrice(network, "ethereum");
            await this.updatePrice(network, "bitcoin");
        }

        // Set up interval for updates
        const updateInterval = 60000; // 1 minute
        setInterval(async () => {
            this.logger.info('Running scheduled price updates...');
            for (const network of this.contracts.keys()) {
                await this.updatePrice(network, "ethereum");
                await this.updatePrice(network, "bitcoin");
            }
        }, updateInterval);
    }
}

module.exports = OracleNode;