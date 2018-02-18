import { injectContract, injectWeb3 } from "./inject";
import Poller from "./poller";
import Sketch from "./sketch";
import { toDataUrl } from "ethereum-blockies";

window.onload = async () => {
  const context = {
    selected: {
      active: false,
      x: -1,
      y: -1
    },
    _lastSyncedBlockNumber: 0,
    selectedColor: 0,
    colorMap: null,
    colors: []
  };

  const sketch = new Sketch(context, {
    onSelect(selected) {
      console.log(selected);
      context.selected = selected;
    }
  });

  context.colors.forEach((c, index) => {
    const div = document.createElement("div");
    div.style.background = `rgb(${c.r}, ${c.g}, ${c.b})`;
    div.className = "color";
    div.onclick = () => {
      context.selectedColor = index;
      $(".color").removeClass("active");
      $(div).addClass("active");
    };
    document.querySelector(".color-pallete").appendChild(div);
  });

  const { metamask, web3 } = await injectWeb3();

  const { contract } = await injectContract(metamask.currentProvider);
  const pollerContract = await injectContract(web3.currentProvider);

  context.contract = contract;
  context.poller = pollerContract.contract;

  console.log(context.contract);

  const poller = Poller.init();
  const submit = document.querySelector(".attempt-submit");

  submit.addEventListener(
    "click",
    e => {
      if (!context.selected.active) return;

      const { x, y } = context.selected;
      contract.fill.estimateGas((error, gas) => {
        if (error) {
          console.error(error);
          return;
        }
        contract.fill(
          x,
          y,
          context.selectedColor,
          {
            from: context.address,
            to: contract.address,
            gas: 25000
          },
          (err, tx) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log(tx);
          }
        );
      });
    },
    false
  );

  poller.queue("sync", () => {
    if (context.address === metamask.eth.accounts[0]) {
      return;
    }
    context.address = metamask.eth.accounts[0];
    document.querySelector(".current_address .logo").src = toDataUrl(
      context.address
    );

    document.querySelector(".current_address .title").innerHTML =
      context.address;
  });

  poller.queue("render", () => {
    const _commitEvent = context.contract.Commit(null, {
      fromBlock: 1 + context._lastSyncedBlockNumber,
      toBlock: "latest"
    });
    _commitEvent.watch(function(error, result) {
      _commitEvent.stopWatching();
      if (!error) {
        console.log(result);
        context._lastSyncedBlockNumber = result.blockNumber;
        let { x, y, color } = result.args;

        x = Number(x);
        y = Number(y);
        color = Number(color);

        context.colorMap[x][y] = color;
        sketch._reference.draw();
      }
    });
  });
};
