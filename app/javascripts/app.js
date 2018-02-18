import { injectContract, injectWeb3 } from "./inject";
import Poller from "./poller";
import Sketch from "./sketch";

window.onload = async () => {
  const context = {
    selected: {
      active: false,
      x: -1,
      y: -1
    },
    _lastSyncedBlockNumber: 0,
    selectedColor: 0,
    colorMap: null
  };

  const sketch = new Sketch(context);

  const {
    metamask,
    web3
  } = await injectWeb3();

  console.log(metamask)

  const { contract } = await injectContract(metamask.currentProvider);
  const pollerContract = await injectContract(web3.currentProvider);

  context.contract = contract;
  context.poller = pollerContract.contract;

  console.log(contract);

  const poller = Poller.init();

  document.querySelector(".attempt-submit").addEventListener(
    "click",
    async () => {
      if (!context.selected.active) return;

      const {x, y} = context.selected;

      const tx = contract.fill(x, y, context.selectedColor, {
        from: context.address,
        to: contract.address,
        gas: 41000
      }, (err, tx) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log(tx)
        }
      );
    },
    false
  );

  poller.queue("sync", () => {
    context.address = metamask.eth.accounts[0];
    document.querySelector(".current_address").innerHTML = context.address;
  });

  poller.queue("render", () => {
    const _commitEvent = context.poller.Commit(null, {
      fromBlock: 1 + context._lastSyncedBlockNumber,
      toBlock: "latest"
    });
    _commitEvent.watch(function (error, result) {
      _commitEvent.stopWatching();
      if (!error) {
        console.log(result);
        context._lastSyncedBlockNumber = result.blockNumber
        let {x, y, color} = result.args;
        x = Number(x)
        y = Number(y)
        color = Number(color)
        context.colorMap[x][y] = color
      }
    })
  });
};
