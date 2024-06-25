// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ValuesDAO is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    uint256 private _nextTokenId;
    mapping(address => mapping(string => uint256)) private minterValueTokenId;
    mapping(address => string[]) private minterValues;

    constructor(address initialOwner)
        ERC721("ValuesDAO", "VALUE")
        Ownable(initialOwner)
    {}


    function safeMint(address to, string memory uri, string memory value) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        minterValueTokenId[to][value] = tokenId;
        minterValues[to].push(value);
    }

    function updateTokenURI(uint256 tokenId, string memory newURI) public onlyOwner {
        _setTokenURI(tokenId, newURI);
    }

    function batchMint(address to, string[] memory uris, string[] memory values) public onlyOwner {
        for (uint256 i = 0; i < uris.length; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uris[i]);
            minterValueTokenId[to][values[i]] = tokenId;
            minterValues[to].push(values[i]);
        }
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function getUserNFTs(address user) public view returns (string[] memory values, uint256[] memory tokenIds) {
        uint256 count = minterValues[user].length;
        values = new string[](count);
        tokenIds = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            string memory value = minterValues[user][i];
            values[i] = value;
            tokenIds[i] = minterValueTokenId[user][value];
        }
    }
}
