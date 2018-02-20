import raw from "../../build/contracts/Placeth.json";
import Web3 from "web3";
import contract from "truffle-contract";

function injectWeb3() {
  return new Promise((resolve, reject) => {
    if (typeof web3 !== "undefined") {
      resolve({
        metamask: new Web3(web3.currentProvider)
      });
    } else {
      reject('Metamask is unavailable. Please allow MetaMask to connect to Ropsten network to function')
    }
  });
}

function injectContract(provider) {
  const Placeth = contract(raw);
  Placeth.setProvider(provider);

  return Promise.resolve(Placeth.at("0xbF6dcd87C7a0D585b23379BC4338235294AeF2F5"))
}

export { injectWeb3, injectContract };
