pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract Placeth is Ownable {
    uint private xBounds;
    uint private yBounds;

    event Commit(uint x, uint y, uint r, uint g, uint b);

    function Placeth (uint xB, uint yB) public {
        xBounds = xB;
        yBounds = yB;
    }

    modifier hasValidColor(uint r, uint g, uint b) {
        require(r >= 0 && r <= 255);
        require(g >= 0 && g <= 255);
        require(b >= 0 && b <= 255);
        _;
    }

    function fill (uint x, uint y, uint r, uint g, uint b) public hasValidColor(r, g, b) {
        Commit(x, y, r, g, b);
    }
}
