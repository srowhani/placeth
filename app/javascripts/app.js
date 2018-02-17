import '../stylesheets/app.css'
import Web3 from 'web3'
import contract from 'truffle-contract'
import raw from '../../build/contracts/Placeth.json'

const Placeth = contract(raw), cHeight = 500, cWidth = 500, sWidth = 100, size = 10
let columns, rows, colorMap, boxToggle = false, squareX, squareY

window.preload = async function () {
  columns = cWidth / size
  rows = cHeight / size
  colorMap = new Array(columns)

  for (var x = 0; x < columns; x++) {
    colorMap[x] = new Array(rows)
    for (var y = 0; y < rows; y++) {
      colorMap[x][y] = randomColor()
    }
  }

  function randomColor () {
    return {
      r:rand(255),
      g:rand(255),
      b:rand(255)
    }

    function rand (max) {
      return Math.floor(Math.random() * Math.floor(max))
    }
  }

  web3Init()
}

window.setup = function() {
  frameRate(0)
  createCanvas(cWidth + sWidth, cHeight)
  window.draw()
}

window.draw = function() {
  drawBoxes()
  if (boxToggle) drawBox()
}

function drawBoxes () {
  let def

  for (var x = 0; x < colorMap.length; x++) {
    for (var y = 0; y < colorMap[x].length; y++) {
      strokeWeight(0)
      const idx = colorMap[x][y]
      const { r, g, b } = idx
      fill(color(r, g, b))

      if (x === squareX && y === squareY) {
        def = {
          x: x * size - 3,
          y: y * size - 3,
          size: size + 6,
          r: idx.r,
          g: idx.g,
          b: idx.b
        }
      }

      rect(x * size, y * size, size, size)
    }
  }

  if (squareX != null && squareY != null && boxToggle) {
    fill(color(def.r, def.g, def.b))
    rect(def.x, def.y, def.size, def.size)
  }
}

function drawBox () {

}

window.mouseClicked = function() {
  if (mouseX < 0 || mouseY < 0 || mouseX > cWidth || mouseY > cHeight) {
    boxToggle = false
  } else {
    boxToggle = true

    if (boxToggle) {
      squareX = Math.floor(mouseX / size)
      squareY = Math.floor(mouseY / size)

      console.log(`Click at ${mouseX}, ${mouseY} === ${squareX}, ${squareY}`)
    }
  }

  draw()
}

async function web3Init () {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask")
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
  }

  let address = web3.eth.accounts[0]
  Placeth.setProvider(web3.currentProvider)
  const contract = await Placeth.deployed()
  console.log(contract)

  let _lastSyncedBlockNumber = 0
  const _interval = () => {
    const _commitEvent = contract.Commit({}, {
      fromBlock: 1 + _lastSyncedBlockNumber,
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

  window.setInterval(_interval, 2500)
}
