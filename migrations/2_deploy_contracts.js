const Placeth = artifacts.require("./Placeth.sol");

module.exports = function(deployer) {
  deployer.deploy(Placeth, 300, 300);
};
