import raw from "../../build/contracts/Placeth.json";
import Web3 from "web3";
import contract from "truffle-contract";
import config from '../../deploy/config';

const HDWalletProvider = require("truffle-hdwallet-provider");

function injectWeb3() {
  return new Promise((resolve, reject) => {
    if (typeof web3 !== "undefined") {
      resolve({
        metamask: new Web3(web3.currentProvider),
        poller: new Web3(new HDWalletProvider(
          config.mnemonic,
          config.provider
        ))
      });
    } else {
      resolve({
        poller: new Web3(new HDWalletProvider(
          config.mnemonic,
          config.provider
        ))
      });
    }
  });
}

function injectContract(provider) {
  const Placeth = contract(raw);
  Placeth.setProvider(provider);

  return Promise.resolve(Placeth.at(config.contract_address))
}

export { injectWeb3, injectContract };
