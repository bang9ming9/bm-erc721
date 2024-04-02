// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC1155, ERC1155Burnable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract TERC1155 is ERC1155Burnable {
    constructor() ERC1155("") {}
    function mint(uint256 id, uint256 value) external {
        _mint(_msgSender(), id, value, "");
    }
}
