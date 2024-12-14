// test/SuperchainOracle.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SuperchainOracle", function () {
    let oracle;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const SuperchainOracle = await ethers.getContractFactory("SuperchainOracle");
        oracle = await SuperchainOracle.deploy("MOCK_AXELAR_GATEWAY");
        await oracle.deployed();

        await oracle.addAsset("ethereum");
    });

    describe("Price Updates", function () {
        it("Should allow oracle to update price", async function () {
            const price = ethers.utils.parseUnits("1500", 8);
            await oracle.updatePrice("ethereum", price, "TEST");

            const [storedPrice, timestamp, source] = await oracle.getPrice("ethereum");
            expect(storedPrice).to.equal(price);
            expect(source).to.equal("TEST");
        });

        it("Should not allow non-oracle to update price", async function () {
            const price = ethers.utils.parseUnits("1500", 8);
            await expect(
                oracle.connect(addr1).updatePrice("ethereum", price, "TEST")
            ).to.be.revertedWith(
                "AccessControl: account " + 
                addr1.address.toLowerCase() + 
                " is missing role"
            );
        });
    });

    describe("Asset Management", function () {
        it("Should allow admin to add new assets", async function () {
            await oracle.addAsset("bitcoin");
            expect(await oracle.supportedAssets("bitcoin")).to.be.true;
        });

        it("Should not allow non-admin to add assets", async function () {
            await expect(
                oracle.connect(addr1).addAsset("bitcoin")
            ).to.be.revertedWith(
                "AccessControl: account " + 
                addr1.address.toLowerCase() + 
                " is missing role"
            );
        });
    });
});