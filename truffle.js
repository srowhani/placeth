// Allows us to use ES6 in our migrations and tests.
require("babel-register");
const hd = require("truffle-hdwallet-provider");
import config from './deploy/config'
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
          config.mnemonic,
          config.provider
        );
      },
      network_id: "3",
      gas: 350000
    }
  }
};
