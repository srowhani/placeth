pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract Placeth is Ownable {
    uint private xBounds;
    uint private yBounds;

    event Commit(uint x, uint y, uint color);

    function Placeth (uint xB, uint yB) public {
        xBounds = xB;
        yBounds = yB;
    }

    modifier hasValidColor(uint color) {
        require(color >= 0 && color <= 15);
        _;
    }

    function fill (uint x, uint y, uint color) public hasValidColor(color) {
        Commit(x, y, color);
    }
}
