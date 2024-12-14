// src/frontend/App.js
import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import { OracleABI } from './contracts/OracleABI';

function App() {
    const [prices, setPrices] = useState({});
    const [selectedAsset, setSelectedAsset] = useState('');
    const [loading, setLoading] = useState(false);

    const supportedAssets = ['ethereum', 'bitcoin'];
    const contractAddresses = {
        'ethereum': '0x9a6C16DbB82a5158Db462b2F48e887B8ae1Dfc07',
        'optimism': '0xA4cC77Be2edC5CEeeF5771e2Fa03204aF2A6e141'
    };

    async function connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                return new BrowserProvider(window.ethereum);
            } catch (error) {
                console.error('Error connecting wallet:', error);
            }
        }
    }

    async function getPrice(network, asset) {
        const provider = await connectWallet();
        const contract = new Contract(
            contractAddresses[network],
            OracleABI,
            provider
        );

        try {
            const result = await contract.getPrice(asset);
            if (!result || result.length < 3) {
                console.error(`Invalid price data received for ${asset}`);
                return null;
            }
            
            const [price, timestamp, source] = result;
            console.log("price", price);
            console.log("timestamp", timestamp);
            console.log("source", source);
            return {
                price: price,
                timestamp: timestamp,
                source
            };
        } catch (error) {
            console.error(`Error fetching price for ${asset}:`, error);
            return null;
        }
    }

    async function requestPrice(asset) {
        setLoading(true);
        const provider = await connectWallet();
        const signer = provider.getSigner();
        const contract = new Contract(
            contractAddresses['ethereum'],
            OracleABI,
            signer
        );

        try {
            const tx = await contract.requestPrice(asset);
            await tx.wait();
            alert(`Price update requested for ${asset}`);
        } catch (error) {
            console.error('Error requesting price:', error);
            alert('Error requesting price update');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        async function fetchPrices() {
            const newPrices = {};
            for (const network of Object.keys(contractAddresses)) {
                newPrices[network] = {};
                for (const asset of supportedAssets) {
                    const price = await getPrice(network, asset);
                    if (price) {
                        newPrices[network][asset] = price;
                    }
                }
            }
            setPrices(newPrices);
        }

        fetchPrices();
        const interval = setInterval(fetchPrices, 60000);
        return () => clearInterval(interval);
    }, [contractAddresses, getPrice, supportedAssets]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">
                Superchain Interop Oracle
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(prices).map(([network, networkPrices]) => (
                    <div key={network} className="border p-4 rounded">
                        <h2 className="text-xl font-bold mb-2">
                            {network.charAt(0).toUpperCase() + network.slice(1)}
                        </h2>
                        {Object.entries(networkPrices).map(([asset, data]) => (
                            <div key={asset} className="mb-2">
                                <p>
                                    {asset.toUpperCase()}: ${(Number(data.price) / Math.pow(10, 8)).toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Last updated: {new Date(Number(data.timestamp) * 1000).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Source: {data.source}
                                </p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <h2 className="text-xl font-bold mb-2">Request Price Update</h2>
                <select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    className="mr-2 p-2 border rounded"
                >
                    <option value="">Select Asset</option>
                    {supportedAssets.map(asset => (
                        <option key={asset} value={asset}>
                            {asset.toUpperCase()}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => requestPrice(selectedAsset)}
                    disabled={!selectedAsset || loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    {loading ? 'Requesting...' : 'Request Update'}
                </button>
            </div>
        </div>
    );
}

export default App;