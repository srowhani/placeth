pragma solidity ^0.4.18;


contract Placeth {
    uint private xBounds;
    uint private yBounds;
    mapping(address => uint) lastSent;

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

    modifier allowedToPlay {
        require(block.number > lastSent[msg.sender] + 20);
        _;
    }

    function fill (uint x, uint y, uint color) public hasValidColor(color) hasValidBounds(x, y) allowedToPlay {
        Commit(x, y, color);
        lastSent[msg.sender] = block.number;
    }
}
