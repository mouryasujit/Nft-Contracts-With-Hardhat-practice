const { assert } = require("chai");
const { developmentChain } = require("../helper-hardhat-config");
const { network, deployments, ethers } = require("hardhat");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Basic Nft unit test", () => {
      let basicNFT, deployer;
      beforeEach(async () => {
        const accounts = await ethers.getSigner();
        deployer = accounts[0];
        await deployments.fixture(["basicNFT"]);
        const basicNftDeployment = await deployments.get("BasicNft");
        const basicNftAddress = basicNftDeployment.address;
        basicNFT = await ethers.getContractAt("basicNFT", basicNftAddress);
      });

      describe("Constructor", () => {
        it("initiazes correctly or not", async () => {
          const name = await basicNFT.name();
          const symbol = await basicNFT.symbol();
          const token = await basicNFT.getTokenCounter();
          assert.equal(name, "cattie");
          assert.equal(symbol, "cattie");
          assert.equal(token.toString(), "0");
        });
      });
    });
