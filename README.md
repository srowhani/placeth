# PlacΞth

## Participants
- Erik Burton
- Seena Rowhani
- Mike Stupich

## Details

Contract can be found at https://ropsten.etherscan.io/address/0xbF6dcd87C7a0D585b23379BC4338235294AeF2F5

Uses truffle for deployments, with deploy scripts to drop page on `gh-pages` branch.

Application front end stack is webpack + vanilla, derived from `truffle unbox` set.
Styling done with `materialize.css`

App mainly consists of fill event that logs `Commit` event as part of transaction.
The client will schedule rerenders of Canvas to live update new modifications made by watching for
latest events of Commit type.

Demo application can be found at http://srowhani.github.io/placeth
