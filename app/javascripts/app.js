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
    selectedColor: 0
  };

  const sketch = new Sketch(context);

  const web3 = await injectWeb3();
  const contract = await injectContract(web3.currentProvider);

  console.log(contract);

  const poller = Poller.init();

  document.querySelector(".attempt-submit").addEventListener(
    "click",
    async () => {
      if (!context.selected.active) return;

      try {
        const tx = await contract.fill(
          context.selected.x,
          context.selected.y,
          context.selectedColor,
          {
            from: context.address,
            to: contract.address,
            gas: 41000
          }
        );
        console.log(tx);
      } catch (err) {
        console.trace(err);
      }
    },
    false
  );

  poller.queue("sync", () => {
    context.address = web3.eth.accounts[0];
    document.querySelector(".current_address").innerHTML = context.address;
  });

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
};
