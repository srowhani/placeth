import '../stylesheets/app.css';

import { injectWeb3, injectContract } from './inject';
import Poller from './poller';

(async () => {
  const context = {
    _lastSyncedBlockNumber: 0
  };
  const cHeight = 500,
        cWidth = 500,
        sWidth = 100,
        size = 10
  let columns, rows, colorMap, boxToggle = false, squareX, squareY

  const web3 = await injectWeb3()
  const contract = await injectContract(web3.currentProvider)

  console.log(contract)

  const poller = Poller.init();

  context.address = web3.eth.accounts[0]

  poller.queue('sync', () => {
    context.address = web3.eth.accounts[0]
  })

  const _reference = new p5(instance => {
    poller.queue('render', () => {
      const _commitEvent = contract.Commit({}, {
        fromBlock: 0 + context._lastSyncedBlockNumber,
        toBlock: 'latest'
      })

      _commitEvent.watch((error, result) => {
        console.log(result)

        if (!error) {
          context._lastSyncedBlockNumber = result.blockNumber
          requestAnimationFrame(_ => drawToCanvas(result))
        }
        _commitEvent.stopWatching()
      })
    })
    instance.preload = async () => {
      columns = cWidth / size
      rows = cHeight / size
      colorMap = Array(columns)
      for (let i = 0 ; i < columns; i++) {
        colorMap[i] = Array(rows)
        for (let j = 0; j < rows; j++) {
          colorMap[i][j] = randomColor()
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
          instance.fill(instance.color(r, g, b))

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

          instance.rect(x * size, y * size, size, size)
        }
      }

      if (squareX != null && squareY != null && boxToggle) {
        instance.fill(instance.color(def.r || 0, def.g || 0, def.b || 0))
        instance.rect(def.x, def.y, def.size, def.size)
      }
    }

    instance.mouseClicked = async (e) => {
      const {x, y} = e;
      if (x < 0 || y < 0 || x > cWidth || y > cHeight) {
        return
      }

      squareX = Math.floor(x / size)
      squareY = Math.floor(y / size)

      context._activeItem = {
        x: squareX,
        y: squareY,
      }

      Object.assign(context, hexToRgb(context._activeColor))
      const {r, g, b} = colorMap[squareX][squareY];
      instance.draw()
      requestAnimationFrame(() => {
        try {
          const tx = await contract.fill(x, y, r, g, b, {
            from: context.address,
            to: contract.address,
            gas: 41000
          })
          console.log(tx)
        } catch (e) {
          console.log(e)
        }
      })
      console.log(`Click at ${x}, ${y} === ${squareX}, ${squareY}`)
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
})();
