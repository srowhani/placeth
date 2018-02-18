pragma solidity ^0.4.18;


contract Placeth {
    uint private xBounds;
    uint private yBounds;

    event Commit(uint x, uint y, uint color);

    function Placeth (uint xB, uint yB) public {
        xBounds = xB;
        yBounds = yB;
    }

    modifier hasValidBounds (uint x, uint y) {
        require(x <= xBounds && x >= 0);
        require(y <= yBounds && y >= 0);
        _;
    }

    modifier hasValidColor(uint color) {
        require(color >= 0 && color <= 15);
        _;
    }

    function fill (uint x, uint y, uint color) public hasValidColor(color) hasValidBounds(x, y) {
        Commit(x, y, color);
    }
}
