# Oracle Price Feed Project

This project demonstrates a decentralized Oracle platform that fetches price feeds for blockchain assets using Optimism and the Superchain ecosystem. The Oracle provides real-time data with transparency and security, enabling reliable on-chain interactions for decentralized applications.

## Contract Addresses
- **Ethereum:** `0x9a6C16DbB82a5158Db462b2F48e887B8ae1Dfc07`
- **Optimism:** `0xA4cC77Be2edC5CEeeF5771e2Fa03204aF2A6e141`

---

## Features
- Fetch real-time price feeds for supported assets (e.g., Ethereum, Bitcoin).
- Request price updates via the Oracle contract.
- Explore decentralized oracles and their role in the Superchain ecosystem.
- Supports a dark-themed "Explore Oracles" section.

---

## Installation and Setup

### Prerequisites
Ensure you have the following installed:
- **Node.js**
- **pnpm** (Package Manager)
- A browser wallet like MetaMask

### Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the backend Oracle server:
   ```bash
   node start-oracle.js
   ```

4. Start the frontend application:
   ```bash
   pnpm start
   ```

5. Open your browser and navigate to `http://localhost:3000`.

---

## How to Use

### 1. Fetch Price Feeds
- View real-time price feeds for supported assets on Ethereum and Optimism.
- Each network card displays the price, timestamp, and source.

### 2. Request Price Update
- Use the dropdown menu to select an asset and click **Request Update**.
- The application sends a transaction to the Ethereum Oracle contract to update the price.

### 3. Explore Oracles
- Click the **Explore** button to view the "Explore Oracles" section.
- Learn about the role of decentralized oracles in the Superchain ecosystem.
- Click **Back to Dashboard** to return.

---

## File Structure
```jsx
.
├── contracts/
│   └── OracleABI.js          // ABI file for the Oracle contract
├── public/
├── src/
│   ├── App.js               // Main React component
│   └── App.css              // Styling for the application
└── start-oracle.js          // Backend server to handle Oracle requests
```

---

## Technologies Used
- **React**: Frontend framework for building the user interface.
- **Ethers.js**: Library for interacting with Ethereum blockchain and smart contracts.
- **Optimism**: Layer-2 scaling solution for Ethereum.
- **Superchain Ecosystem**: For scalable cross-chain interoperability.

---

## Contributing
Contributions are welcome! Feel free to fork the repository and submit a pull request.

---

## License
This project is licensed under the MIT License.

