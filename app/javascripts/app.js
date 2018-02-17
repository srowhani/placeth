// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";
import p5 from 'p5';

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

  let address = web3.eth.accounts[0];


  Placeth.setProvider(web3.currentProvider);

  const contract = await Placeth.deployed()
  console.log(contract)

  const getCursorPosition = (canvas, event) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(event.clientX - rect.left) - fill_o[0];
      const y = Math.floor(event.clientY - rect.top) - fill_o[1];
      return {x, y}
  }

  const fill_d = [10, 10]
  const fill_o = [5, 5]

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  console.log(context)
  const commit_positions = {}

  canvas.width = 800;
  canvas.height = 800;

  let r = 255,
      g = 255,
      b = 255;

  canvas.addEventListener('click', e => {
    const pos = getCursorPosition(canvas, e);
    commit_positions[`${pos.x}-${pos.y}`] = !commit_positions[`${pos.x}-${pos.y}`]
    const shouldFill = commit_positions[`${pos.x}-${pos.y}`]
    context[shouldFill ? 'fillRect' : 'clearRect'](pos.x, pos.y, ...fill_d)

    contract.fill(pos.x, pos.y, {})
  }, false)

  canvas.addEventListener('mouseover', e => {
    const pos = getCursorPosition(canvas, e);
    console.log(pos)
  })

  const drawToCanvas = (result) => {
    // TODO: Render to canvas
  }

  let _lastSyncedBlockNumber = 0;
  const _interval = () => {
    const _commitEvent = contract.Commit({}, {
      fromBlock: _lastSyncedBlockNumber,
      toBlock: 'latest'
    })

    _commitEvent.watch((error, result) => {
      if (!error) {
        _lastSyncedBlockNumber = result.blockNumber
        requestAnimationFrame(_ => drawToCanvas(result))
      }
      _commitEvent.stopWatching()
    })
  }

  window.setInterval(_interval, 2500);


  document.querySelector('.container').appendChild(canvas)
});
