const Election = artifacts.require("Election");

module.exports = function(deployer) {
  // Deploy Election contract with a voting duration of 300 seconds (5 minutes)
  deployer.deploy(Election, 300);
};