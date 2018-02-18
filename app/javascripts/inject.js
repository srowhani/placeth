import raw from "../../build/contracts/Placeth.json";
import Web3 from "web3";
import contract from "truffle-contract";

function injectWeb3() {
  return new Promise(resolve => {
    if (typeof web3 !== "undefined") {
      // Use Mist/MetaMask's provider
      resolve({
        metamask: new Web3(web3.currentProvider)
      });
    } else {
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      resolve({
        web3: new Web3(
          new Web3.providers.HttpProvider(
            "https://ropsten.infura.io/cglHTDR60SijNPajNpZZ"
          )
        )
      });
    }
  });
}

function injectContract(provider) {
  const Placeth = contract(raw);
  Placeth.setProvider(provider);

  return Promise.resolve(
    Placeth.at("0xbF6dcd87C7a0D585b23379BC4338235294AeF2F5")
  );
}

export { injectWeb3, injectContract };
