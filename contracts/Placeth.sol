pragma solidity 0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract Placeth is Ownable {
    uint private minCost;
    uint private xBounds;
    uint private yBounds;

    event Commit(address indexed _addr, uint x, uint y, uint r, uint g, uint b);

    function Placeth (uint _minCost) public {
        minCost = _minCost;
    }

    modifier hasValidCoordinates(uint attemptX, uint attemptY) {
        require(attemptX >= 0 && attemptX < xBounds);
        require(attemptY >= 0 && attemptY < xBounds);
        _;
    }

    modifier hasValidColor(uint r, uint g, uint b) {
        require(r >= 0 && r <= 255);
        require(g >= 0 && g <= 255);
        require(b >= 0 && b <= 255);
        _;
    }

    function fill (uint x, uint y, uint r, uint g, uint b) public hasValidCoordinates(x, y) hasValidColor(r, g, b) {
        Commit(msg.sender, x, y, r, g, b);
    }
}
