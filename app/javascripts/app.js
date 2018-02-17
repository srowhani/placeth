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
    size = 5,
    columns = cWidth / size,
    rows = cHeight / size,
    magnifySize = size / 2 - 1 || 1;

  let selected = {
    active: false,
    x: -1,
    y: -1
  };

  let colorMap, squareX, squareY;

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
        fromBlock: 1 + context._lastSyncedBlockNumber,
        toBlock: 'latest'
      }, (error, result) => {
        console.log(result)

        if (!error) {
          context._lastSyncedBlockNumber = result.blockNumber
          requestAnimationFrame(_ => drawToCanvas(result))
        }
      })
    })

    // Preload - gets called before setup or draw
    instance.preload = async () => {
      colorMap = new Array(columns);

      for (var x = 0; x < colorMap.length; x++) {
        colorMap[x] = new Array(rows);
        for (var y = 0; y < colorMap[x].length; y++) {
          colorMap[x][y] = randomColor();
        }
      }

      function rand(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }

      function randomColor() {
        return {
          r: rand(255),
          g: rand(255),
          b: rand(255)
        };
      }
    };

    //Setup - Creates canvas commences drawing
    instance.setup = () => {
      const canvas = instance.createCanvas(cWidth + sWidth, cHeight);
      canvas.parent("application");
      instance.frameRate(0);
      instance.draw();
    };

    //Draw
    instance.draw = () => {
      drawGrid();
    };

    function drawGrid() {
      let def;

      for (let x = 0; x < colorMap.length; x++) {
        for (let y = 0; y < colorMap[x].length; y++) {
          instance.strokeWeight(0);
          const idx = colorMap[x][y];
          const { r, g, b } = idx;
          instance.fill(instance.color(r, g, b));
          instance.rect(x * size, y * size, size, size);
        }
      }

      if (selected.active) {
        const sqr = colorMap[selected.x][selected.y];

        instance.fill(instance.color(sqr.r, sqr.g, sqr.b));
        instance.rect(
          selected.x * size - magnifySize,
          selected.y * size - magnifySize,
          size + magnifySize*2,
          size + magnifySize*2
        );
      }
    }

    instance.mouseClicked = async e => {
      const { x, y } = e;

      console.log(instance.mouseX, instance.mouseY);

      let mouseX = instance.mouseX;
      let mouseY = instance.mouseY;

      selected.active = true;

      if (x < 0 || y < 0 || mouseX > cWidth + sWidth || mouseY > cHeight) {
        return;
      }

      selected.x = Math.floor(mouseX / size);
      selected.y = Math.floor(mouseY / size);

      context._activeItem = {
        x: selected.x,
        y: selected.y
      };

      console.log(
        `Click at ${mouseX}, ${mouseY} === ${selected.x}, ${selected.y}`
      );

      instance.draw();

      Object.assign(context, hexToRgb(context._activeColor));
      const { r, g, b } = colorMap[selected.x][selected.y];

      try {
        const tx = await contract.fill(selected.x, selected.y, r, g, b, {
          from: context.address,
          to: contract.address,
          gas: 41000
        });
        console.log(tx);
      } catch (err) {
        console.trace(err)
      }
    };
  });
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  }
})();
