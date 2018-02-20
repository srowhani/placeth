import { injectContract, injectWeb3 } from "./inject";
import Poller from "./poller";
import Sketch from "./sketch";
import { toDataUrl } from "ethereum-blockies";

window.onload = async () => {
  $('.modal').modal()
  const context = {
    selected: {
      active: false,
      x: -1,
      y: -1
    },
    _lastSyncedBlockNumber: 0,
    selectedColor: 0,
    colorMap: null,
    colors: [],
    modifiedPixels: []
  };

  const sketch = new Sketch(context, {
    onSelect(selected) {
      context.selected = selected;
    }
  });

  sketch._reference.draw()

  context.colors.slice(0, context.colors.length - 1).forEach((c, index) => {
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

  const { metamask } = await injectWeb3()
    .catch(err => {
      $('#error-modal').modal('open')
      $('.modal-content').html(err)

      return {
        metamask: null
      }
    });

  if (!metamask) {
    return;
  }


  const shouldContinue = await new Promise (resolve => {
    metamask.version.getNetwork((err, net_id) => {
      if (err) {
        resolve(false)
      } else {
        resolve(net_id == 3)
      }
    })
  })

  if (!shouldContinue) {
    $('#error-modal').modal('open')
    $('.modal-content').html('Must be connected to Ropsten network for application to function')
    return;
  }

  const { contract } = await injectContract(metamask.currentProvider)

  if (!contract) {
    return;
  }
  context.contract = contract;

  const poller = Poller.init();
  const submit = document.querySelector(".attempt-submit");

  submit.addEventListener(
    "click",
    e => {
      if (!context.selected.active) return;

      const { x, y } = context.selected;
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
            $('#error-modal').modal('open')
            $('.modal-content').html(err.message)
            return;
          }
        }
      );
    },
    false
  );

  poller.queue("sync", () => {
    if (context.address === metamask.eth.accounts[0]) {
      return;
    }
    context.address = metamask.eth.accounts[0];
    document.querySelector(".current_address .logo").src = toDataUrl(context.address);

    document.querySelector(".current_address .title").innerHTML = context.address;
  });
  const blockNumber = document.querySelector('.block-number')
  poller.queue("render", () => {

    const _commitEvent = context.contract.Commit(null, {
      fromBlock: 1 + context._lastSyncedBlockNumber,
      toBlock: "latest"
    });
    _commitEvent.watch(function(error, result) {
      _commitEvent.stopWatching();
      if (!error) {
        context._lastSyncedBlockNumber = result.blockNumber;
        let { x, y, color } = result.args;
        x = Number(x);
        y = Number(y);
        color = Number(color);

        context.colorMap[x][y] = color;
        context.modifiedPixels.push({x, y, color})
      }
    });
    sketch._reference.smart_draw()
  });
};
