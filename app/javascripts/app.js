import "../stylesheets/app.css";
import Web3 from "web3";
import contract from "truffle-contract";
import raw from "../../build/contracts/Placeth.json";
//import p5 from 'p5';

(() => {
  const context = {};
  const Placeth = contract(raw),
    cHeight = 500,
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

  const _reference = new p5(instance => {
    // Preload - gets called before setup or draw
    instance.preload = async () => {
      colorMap = new Array(columns);

      for (var x = 0; x < colorMap.length; x++) {
        colorMap[x] = new Array(rows);
        for (var y = 0; y < colorMap[x].length; y++) {
          colorMap[x][y] = randomColor();
        }
      }

      function randomColor() {
        return {
          r: rand(255),
          g: rand(255),
          b: rand(255)
        };

        function rand(max) {
          return Math.floor(Math.random() * Math.floor(max));
        }
      }

      await web3Init();
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

      for (var x = 0; x < colorMap.length; x++) {
        for (var y = 0; y < colorMap[x].length; y++) {
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
        const tx = await window.contract.fill(selected.x, selected.y, r, g, b, {
          from: address,
          to: contract.address,
          gas: 41000
        });
        console.log(tx);
      } catch (e) {
        console.log("Transaction rejected");
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

  async function web3Init() {
    if (typeof web3 !== "undefined") {
      console.warn(
        "Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask"
      );
      // Use Mist/MetaMask's provider
      window.web3 = new Web3(web3.currentProvider);
    } else {
      console.warn(
        "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask"
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      window.web3 = new Web3(
        new Web3.providers.HttpProvider("http://127.0.0.1:8545")
      );
    }

    window.address = web3.eth.accounts[0];
    Placeth.setProvider(web3.currentProvider);
    window.contract = await Placeth.deployed();

    console.log(window.contract);

    let _lastSyncedBlockNumber = 0;
    const _interval = () => {
      const _commitEvent = window.contract.Commit(
        {},
        {
          fromBlock: 1 + _lastSyncedBlockNumber,
          toBlock: "latest"
        }
      );

      _commitEvent.watch((error, result) => {
        if (!error) {
          _lastSyncedBlockNumber = result.blockNumber;
          requestAnimationFrame(_ => _reference.draw(result));
        }
        _commitEvent.stopWatching();
      });
    };

    window.setInterval(_interval, 2500);
  }
})();
