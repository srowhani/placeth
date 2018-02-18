// Allows us to use ES6 in our migrations and tests.
require("babel-register");
const hd = require("truffle-hdwallet-provider");
const mnemonic =
  "joy ceiling kitten celery grass seed settle path again improve fever science";

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gas: 4000000,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {
        return new hd(
          mnemonic,
          "https://ropsten.infura.io/cglHTDR60SijNPajNpZZ"
        );
      },
      network_id: "3",
      gas: 350000
    }
  }
};
