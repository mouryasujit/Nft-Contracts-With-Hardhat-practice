const { run } = require("hardhat");

const verify = async (contractAddress, args) => {
  console.log("verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      ConstructorArguments: args,
    });
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("already verified");
    } else {
      console.log(e);
    }
  }
};

module.exports = { verify };
