import '../stylesheets/app.css'
import Web3 from 'web3'
import contract from 'truffle-contract'
import raw from '../../build/contracts/Placeth.json'
import p5 from 'p5';

(() => {
  const context = {};
  const Placeth = contract(raw),
        cHeight = 500,
        cWidth = 500,
        sWidth = 100,
        size = 10
  let columns, rows, colorMap, boxToggle = false, squareX, squareY

  const _reference = new p5(instance => {
    instance.preload = async () => {
      columns = cWidth / size
      rows = cHeight / size
      colorMap = Array(columns).fill(null)

      colorMap = colorMap.map(
        column => Array(rows).fill({
          r: 0,
          g: 0,
          b: 0
        })
      )
      console.log(colorMap)

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

      await web3Init()
    }
    instance.setup = () => {
      const canvas = instance.createCanvas(cWidth + sWidth, cHeight)
      canvas.parent('application')
      instance.frameRate(0)
      instance.draw()
    }

    instance.draw = () => {
      drawBoxes()
      if (boxToggle) drawBox()
    }

    function drawBox () {

    }

    function drawBoxes () {
      let def

      for (var x = 0; x < colorMap.length; x++) {
        for (var y = 0; y < colorMap[x].length; y++) {
          instance.strokeWeight(0)
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

    instance.mouseClicked = async (e) => {
      const {x, y} = e;
      if (x < 0 || y < 0 || mouseX > cWidth || mouseY > cHeight) {
        return
      }

      squareX = Math.floor(mouseX / size)
      squareY = Math.floor(mouseY / size)

      context._activeItem = {
        x: squareX,
        y: squareY,
      }
      Object.assign(context, hexToRgb(context._activeColor))
      const {r, g, b} = colorMap[squareX][squareY];
      console.log(squareX, squareY, r, g, b)
      try {
        const tx = await window.contract.fill(squareX, squareY, r, g, b, {
          from: address,
          to: contract.address,
          gas: 41000
        })
        console.log(tx)
      } catch (e) {
        console.log('Transaction rejected')
      }

      console.log(`Click at ${mouseX}, ${mouseY} === ${squareX}, ${squareY}`)
    }
  })

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
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

    window.address = web3.eth.accounts[0]
    Placeth.setProvider(web3.currentProvider)
    window.contract = await Placeth.deployed()

    console.log(window.contract)

    let _lastSyncedBlockNumber = 0
    const _interval = () => {
      const _commitEvent = window.contract.Commit({}, {
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
})();
