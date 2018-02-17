import "../stylesheets/app.css";

import { injectWeb3, injectContract } from "./inject";
import Poller from "./poller";

(async () => {
  const context = {
    _lastSyncedBlockNumber: 0
  };
  const cHeight = 500,
    cWidth = 500,
    size = 5,
    columns = cWidth / size,
    rows = cHeight / size,
    magnifySize = size / 2 - 1 || 1;

  const colors = [
    { r: 34, g: 34, b: 34 }, //Black
    { r: 229, g: 0, b: 0 }, //Red
    { r: 130, g: 0, b: 128 }, //Purple
    { r: 160, g: 106, b: 66 }, //Brown
    { r: 136, g: 136, b: 136 }, //Grey
    { r: 148, g: 224, b: 68 }, //Light Green
    { r: 207, g: 110, b: 228 }, //Light Purple
    { r: 228, g: 228, b: 22 }, //Light Grey
    { r: 2, g: 190, b: 1 }, //Green
    { r: 0, g: 0, b: 234 }, //Royal Blue
    { r: 0, g: 131, b: 199 }, //Light Blue
    { r: 229, g: 149, b: 0 }, //Orange/Gold
    { r: 0, g: 211, b: 221 }, //Cyan
    { r: 229, g: 217, b: 0 }, //Yellow
    { r: 255, g: 167, b: 209 }, //Pink
    { r: 255, g: 255, b: 255 } //White
  ];
  let selected = {
    active: false,
    x: -1,
    y: -1
  };
  let colorMap, squareX, squareY;

  const web3 = await injectWeb3();
  const contract = await injectContract(web3.currentProvider);

  console.log(contract);

  const poller = Poller.init();

  context.address = web3.eth.accounts[0];

  poller.queue("sync", () => {
    context.address = web3.eth.accounts[0];
  });

  const _reference = new p5(instance => {
    poller.queue("render", () => {
      const _commitEvent = contract.Commit(
        {},
        {
          fromBlock: 1 + context._lastSyncedBlockNumber,
          toBlock: "latest"
        },
        (error, result) => {
          console.log(result);

          if (!error) {
            context._lastSyncedBlockNumber = result.blockNumber;
            requestAnimationFrame(_ => drawToCanvas(result));
          }
        }
      );
    });

    // Preload - gets called before setup or draw
    instance.preload = async () => {
      colorMap = new Array(columns);

      for (var x = 0; x < colorMap.length; x++) {
        colorMap[x] = new Array(rows);
        for (var y = 0; y < colorMap[x].length; y++) {
          colorMap[x][y] = rand(16);
        }
      }

      function rand(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }
    };

    //Setup - Creates canvas commences drawing
    instance.setup = () => {
      const canvas = instance.createCanvas(cWidth, cHeight);
      canvas.parent("application");
      instance.frameRate(0);
      instance.draw();
    };

    //Draw
    instance.draw = () => {
      drawGrid();
      drawSelected();
    };

    //Draws grid
    function drawGrid() {
      instance.strokeWeight(0);

      for (let x = 0; x < colorMap.length; x++) {
        for (let y = 0; y < colorMap[x].length; y++) {
          const idx = colorMap[x][y];
          const { r, g, b } = colors[idx];
          instance.fill(instance.color(r, g, b));
          instance.rect(x * size, y * size, size, size);
        }
      }
    }

    function drawSelected() {
      if (!selected.active) return;

      const idx = colorMap[selected.x][selected.y];
      const { r, g, b } = colors[idx];

      instance.strokeWeight(1);
      instance.fill(instance.color(r, g, b));
      instance.rect(
        selected.x * size - magnifySize,
        selected.y * size - magnifySize,
        size + magnifySize * 2,
        size + magnifySize * 2
      );
    }

    instance.mouseClicked = async () => {
      const mouseX = instance.mouseX,
        mouseY = instance.mouseY;

      // Square Selection
      if (mouseX > 0 && mouseY > 0 && mouseX < cWidth && mouseY < cHeight) {
        selected.active = true;

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
      }

      // Object.assign(context, hexToRgb(context._activeColor));
      // const { r, g, b } = colorMap[selected.x][selected.y];

      // try {
      //   const tx = await contract.fill(selected.x, selected.y, r, g, b, {
      //     from: context.address,
      //     to: contract.address,
      //     gas: 41000
      //   });
      //   console.log(tx);
      // } catch (err) {
      //   console.trace(err);
      // }
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
