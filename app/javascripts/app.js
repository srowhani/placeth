import {
  injectContract,
  injectWeb3
} from "./inject";
import Poller from "./poller";
import Sketch from "./sketch";
import {
  toDataUrl
} from "ethereum-blockies";
const ROPSTEN_NETWORK_ID = 3;

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

  const {
    metamask,
    poller
  } = await injectWeb3()
    .catch(err => {
      $('#error-modal').modal('open')
      $('.modal-content').html(err)

      return {
        metamask: null,
        poller: null
      }
    });

  const isConnectedToRopsten = await new Promise(resolve =>
    poller.version.getNetwork((err, net_id) => resolve(err ? false : net_id == ROPSTEN_NETWORK_ID)))

  if (!isConnectedToRopsten) {
    $('#error-modal').modal('open')
    $('.modal-content').html('You must be connected to Ropsten network to proceed')
    return;
  }

  const {
    contract
  } = await injectContract(poller.currentProvider)

  if (!contract) {
    return;
  }

  context.contract = contract;

  const _poller = Poller.init();
  const submit = document.querySelector(".attempt-submit");

  submit.onclick = e => {
    if (!context.selected.active) return;

    if (!metamask) {
      $('#error-modal').modal('open')
      $('.modal-content').html('You need MetaMask installed and connected to ropsten to be able to transact!')
      return;
    }

    const {
      x,
      y
    } = context.selected;
    contract.fill(
      x,
      y,
      context.selectedColor, {
        from: context.address,
        to: contract.address,
        gas: 25000
      },
      (err, tx) => {
        console.log(tx);
        if (err) {
          $('#error-modal').modal('open')
          $('.modal-content').html(err.message)
          return;
        }
      }
    );
  };
  _poller.queue("sync", () => {
    if (!metamask) return;
    metamask.eth.getAccounts((err, accounts) => {
      if (context.address === accounts[0])
        return;

      if (!err) {
        context.address = accounts[0];
        document.querySelector('.current_address').style.display = 'flex';
        document.querySelector(".current_address .logo").src = toDataUrl(context.address);
        document.querySelector(".current_address .title").innerHTML = context.address;
      }

    })
  });
  const blockNumber = document.querySelector('.block-number')
  _poller.queue("render", () => {
    const _commitEvent = context.contract.Commit(null, {
      fromBlock: 1 + context._lastSyncedBlockNumber,
      toBlock: "latest"
    });

    _commitEvent.requestManager.stopPolling();
    _commitEvent.watch(function(error, result) {
      if (!error) {
        context._lastSyncedBlockNumber = result.blockNumber;
        let {
          x,
          y,
          color
        } = result.args;
        x = Number(x);
        y = Number(y);
        color = Number(color);

        context.colorMap[x][y] = color;
        context.modifiedPixels.push({
          x,
          y,
          color
        })
        sketch._reference.smart_draw();
      }
    });
  });
};
