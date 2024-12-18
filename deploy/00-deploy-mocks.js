const { developmentChains } = require("../helper-hardhat-config");
const { ethers } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments, network }) {
  const BASE_FEE = ethers.utils.parseEther("0.25");
  const GAS_PRICE_LINK = 1e9;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = [BASE_FEE, GAS_PRICE_LINK];

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorDeploy = await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: args,
    });

    const VrfCoordinatorAddress = await deployments.get("VRFCoordinatorV2Mock");
    console.log(VrfCoordinatorAddress.address);//a.bi karoge to abi mil jayega
    log("___________________Mocks Deployed____________");
  }
};

module.exports.tags = ["all", "mocks"];
