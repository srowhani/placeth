// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import Web3 from 'web3';
import contract from 'truffle-contract'

import raw from '../../build/contracts/Placeth.json'

const Placeth = contract(raw);

window.addEventListener('load', async () => {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  Placeth.setProvider(web3.currentProvider);

  const contract = await Placeth.deployed()
  console.log(contract)

  function getCursorPosition(canvas, event) {
      var rect = canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      return {x, y}
  }

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = 800;
  canvas.height = 800;

  canvas.addEventListener('click', e => {
    const pos = getCursorPosition(canvas, e);
    console.log(pos)
  }, false)

  document.querySelector('.container').appendChild(canvas)

});
