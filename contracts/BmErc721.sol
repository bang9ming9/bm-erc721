// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721, ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

interface IERC1155 {
    function burn(address account, uint256 id, uint256 value) external;
    function burnBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory values
    ) external;
}

contract BmErc721 is ERC721Enumerable, Ownable {
    error BmErc721NilInput(string arg);
    error BmErc721ZeroERC1155ID();
    error BmErc721DuplicatedDataHash(string value, bytes32 dataHash);
    error BmErc721InvalidERC1155Value(uint256 sum, uint256 need);
    error BmErc721IsNotTransferable(uint256 tokenID);

    event TransferAbleSet(uint256 indexed tokenID, bool indexed able);

    uint256 public constant MINT_COST = 0.5 ether;
    IERC1155 public immutable BM_ERC1155;

    uint256 private _idCounter;
    string private _baseURI_;
    mapping(uint256 tokenID => bool) public transferable;
    mapping(uint256 tokenID => string) public tokenData;
    mapping(bytes32 dataHash => bool) public existed;

    constructor(
        address owner,
        address erc1155,
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(owner) {
        if (erc1155 == address(0)) revert BmErc721NilInput("erc1155");
        BM_ERC1155 = IERC1155(erc1155);
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseURI_ = baseURI;
    }

    function setTransferable(uint256 tokenID, bool able) external onlyOwner {
        if (transferable[tokenID] != able) {
            transferable[tokenID] = able;
            emit TransferAbleSet(tokenID, able);
        }
    }

    function burn(uint256 tokenID) external {
        // Setting an "auth" arguments enables the `_isAuthorized` check which verifies that the token exists
        // (from != 0). Therefore, it is not needed to verify that the return value is not 0 here.
        _update(address(0), tokenID, _msgSender());
    }

    function mint(uint256 burnID, string calldata value) external {
        if (burnID == 0) revert BmErc721ZeroERC1155ID();
        address account = _msgSender();

        BM_ERC1155.burn(account, burnID, MINT_COST);
        _mintSet(account, value);
    }

    function mint(
        uint256[] memory burnIDs,
        uint256[] memory amounts,
        string calldata value
    ) external {
        uint256 length = amounts.length;
        if (length == 0) revert BmErc721NilInput("amounts");

        uint256 sum;
        for (uint256 i = 0; i < length; ) {
            sum += amounts[i];
            unchecked {
                ++i;
            }
        }
        if (sum != MINT_COST)
            revert BmErc721InvalidERC1155Value(sum, MINT_COST);

        address account = _msgSender();

        BM_ERC1155.burnBatch(account, burnIDs, amounts);
        _mintSet(account, value);
    }

    function _mintSet(address to, string calldata value) private {
        bytes32 dataHash = keccak256(abi.encodePacked(value));
        if (existed[dataHash])
            revert BmErc721DuplicatedDataHash(value, dataHash);

        uint256 tokenID = ++_idCounter;
        _mint(to, tokenID);

        existed[dataHash] = true;
        tokenData[tokenID] = value;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseURI_;
    }

    function _update(
        address to,
        uint256 tokenID,
        address auth
    ) internal override returns (address) {
        address from = super._update(to, tokenID, auth);

        // mint, burn 이 아니라면 (transfer 라면) transferable 한 상태여야 한다.
        if (!(from == address(0) || to == address(0))) {
            if (!transferable[tokenID])
                revert BmErc721IsNotTransferable(tokenID);
        }

        if (to == address(0)) {
            delete existed[keccak256(abi.encodePacked(tokenData[tokenID]))];
            delete tokenData[tokenID];
        }

        return from;
    }
}
