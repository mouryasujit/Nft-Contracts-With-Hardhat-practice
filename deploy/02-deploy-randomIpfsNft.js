const { network } = require("hardhat");
const { ethers } = require("hardhat");
const { verify } = require("../utils/verify");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const {
  storeImages,
  storeTokenUriMetadata,
} = require("../utils/UploadToPinata");

const FUND_AMOUNT = "1000000000000000000000";
const imagesLocation = "./images/randomNft/";
const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Cuteness",
      value: 100,
    },
  ],
};

let tokenUris = [
  "ipfs://QmRNGKwgoxS6jSkQ1HS2kjnpLYoBPPdU3UY1cMEpWhsi8r",
  "ipfs://QmRXr7aEq7UXXQSqaoJeAXx7r71L4HqnaRJieLz1HUBwiF",
  "ipfs://QmZgDm9bJau78HkJyPW31G7rHAtZfK7iEtuK9FyUQvLAWT",
];
module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  log(
    "---------------------------02-deploy running---------------------------"
  );

  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenUris = await handleTokenUris();
  }
  let Address, SubscriptionId, vrfCoordinatorV2Mock;
  if (developmentChains.includes(network.name)) {
    const VrfCoordinator = await deployments.get("VRFCoordinatorV2Mock");
    Address = VrfCoordinator.address;
    vrfCoordinatorV2Mock = await ethers.getContractAt(
      "VRFCoordinatorV2Mock",
      Address
    );
    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const receipt = await tx.wait(1);
    SubscriptionId = receipt.events[0].args.subId;
    await vrfCoordinatorV2Mock.fundSubscription(SubscriptionId, FUND_AMOUNT);
  } else {
    Address = networkConfig[chainId].VrfCoordinatorV2;
    SubscriptionId = networkConfig[chainId].subscriptionId;
  }

  const arguments = [
    Address,
    SubscriptionId,
    networkConfig[chainId]["gasLane"],
    networkConfig[chainId]["mintFee"],
    networkConfig[chainId]["callbackGasLimit"],
    tokenUris,
  ];
  const randomIpfsNft = await deploy("randomIpfsNft", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  if (chainId == 31337) {
    await vrfCoordinatorV2Mock.addConsumer(
      // Changed from consumerIsAdded
      SubscriptionId,
      randomIpfsNft.address
    );
  }

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(randomIpfsNft.address, arguments);
  }
};

async function handleTokenUris() {
  const tokenUris = [];
  const { responses: imageUploadResponses, files } =
    await storeImages(imagesLocation);
  for (const imageUploadResponseIndex in imageUploadResponses) {
    let tokenUriMetadata = { ...metadataTemplate };
    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(
      /\b.png|\b.jpg|\b.jpeg/,
      ""
    );
    tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
    console.log(`Uploading ${tokenUriMetadata.name}...`);
    const metadataUploadResponse =
      await storeTokenUriMetadata(tokenUriMetadata);
    tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
  }
  console.log("Token URIs uploaded! They are:");
  console.log(tokenUris);
  return tokenUris;
}

module.exports.tags = ["all", "randomipfs", "main"];
