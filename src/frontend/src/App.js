import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { OracleABI } from "./contracts/OracleABI";
import "./App.css";

function App() {
  const [prices, setPrices] = useState({});
  const [selectedAsset, setSelectedAsset] = useState("");
  const [loading, setLoading] = useState(false);

  const supportedAssets = ["ethereum", "bitcoin"];
  const contractAddresses = {
    ethereum: "0x9a6C16DbB82a5158Db462b2F48e887B8ae1Dfc07",
    optimism: "0xA4cC77Be2edC5CEeeF5771e2Fa03204aF2A6e141",
  };

  async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        return new BrowserProvider(window.ethereum);
      } catch (error) {
        console.error("Error connecting wallet:", error);
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
      return {
        price: price,
        timestamp: timestamp,
        source,
      };
    } catch (error) {
      console.error(`Error fetching price for ${asset}:`, error);
      return null;
    }
  }

  async function requestPrice(asset) {
    setLoading(true);
    const provider = await connectWallet();
    const signer = await provider.getSigner();
    const contract = new Contract(
      contractAddresses["ethereum"],
      OracleABI,
      signer
    );

    try {
      const tx = await contract.requestPrice(asset);
      await tx.wait();
      alert(`Price update requested for ${asset}`);
    } catch (error) {
      console.error("Error requesting price:", error);
      alert("Error requesting price update");
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
  }, []);

  return (
    <div className="container">
      <h1 className="oracle-header">Superchain Interop Oracle</h1>

      <div className="network-grid">
        {Object.entries(prices).map(([network, networkPrices]) => (
          <div key={network} className="network-card">
            <h2 className="network-title">
              {network.charAt(0).toUpperCase() + network.slice(1)}
            </h2>
            {Object.entries(networkPrices).map(([asset, data]) => (
              <div key={asset} className="asset-info">
                <p className="asset-price">
                  {asset.toUpperCase()}: $
                  {(Number(data.price) / Math.pow(10, 8)).toFixed(2)}
                </p>
                <div className="price-details">
                  <p>
                    Last updated:{" "}
                    {new Date(Number(data.timestamp) * 1000).toLocaleString()}
                  </p>
                  <p>Source: {data.source}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="price-request-section">
        <h2>Request Price Update</h2>
        <select
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
          className="asset-select"
        >
          <option value="">Select Asset</option>
          {supportedAssets.map((asset) => (
            <option key={asset} value={asset}>
              {asset.toUpperCase()}
            </option>
          ))}
        </select>
        <button
          onClick={() => requestPrice(selectedAsset)}
          disabled={!selectedAsset || loading}
          className="request-btn"
        >
          {loading ? "Requesting..." : "Request Update"}
        </button>
      </div>
    </div>
  );
}

export default App;
