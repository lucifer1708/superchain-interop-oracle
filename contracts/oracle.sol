// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";

contract SuperchainOracle is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IAxelarGateway public immutable axelarGateway;

    struct PriceData {
        uint256 price;
        uint256 timestamp;
        string source;
    }

    mapping(string => PriceData) public prices;
    mapping(string => bool) public supportedAssets;

    event PriceUpdated(string asset, uint256 price, uint256 timestamp);
    event PriceRequested(string asset, address requester);
    event AssetAdded(string asset);
    event AssetRemoved(string asset);

    constructor(address _axelarGateway) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        axelarGateway = IAxelarGateway(_axelarGateway);
    }

    function addAsset(string memory asset) external onlyRole(ADMIN_ROLE) {
        supportedAssets[asset] = true;
        emit AssetAdded(asset);
    }

    function removeAsset(string memory asset) external onlyRole(ADMIN_ROLE) {
        supportedAssets[asset] = false;
        emit AssetRemoved(asset);
    }

    function requestPrice(string memory asset) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        require(supportedAssets[asset], "Asset not supported");
        emit PriceRequested(asset, msg.sender);
    }

    function updatePrice(
        string memory asset,
        uint256 price,
        string memory source
    ) 
        external 
        onlyRole(ORACLE_ROLE) 
        whenNotPaused 
    {
        require(supportedAssets[asset], "Asset not supported");
        require(price > 0, "Invalid price");

        prices[asset] = PriceData({
            price: price,
            timestamp: block.timestamp,
            source: source
        });

        emit PriceUpdated(asset, price, block.timestamp);
    }

    function getPrice(string memory asset) 
        external 
        view 
        returns (
            uint256 price,
            uint256 timestamp,
            string memory source
        ) 
    {
        require(supportedAssets[asset], "Asset not supported");
        PriceData memory data = prices[asset];
        require(data.timestamp > 0, "Price not available");
        return (data.price, data.timestamp, data.source);
    }

    // Cross-chain message handling
    function handleCrossChainPrice(
        string memory sourceChain,
        string memory asset,
        uint256 price
    ) 
        external 
        onlyRole(ORACLE_ROLE) 
    {
        require(supportedAssets[asset], "Asset not supported");
        prices[asset] = PriceData({
            price: price,
            timestamp: block.timestamp,
            source: sourceChain
        });
        emit PriceUpdated(asset, price, block.timestamp);
    }
}