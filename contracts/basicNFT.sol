// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
contract basicNFT is ERC721 {
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    uint256 private s_tokenCounter;
    constructor() ERC721("cattie","cattie") {
        s_tokenCounter=0;
    }

    function mintNft() public returns(uint256){
        _safeMint(msg.sender,s_tokenCounter);
        s_tokenCounter++;
        return s_tokenCounter;

    }
    function getTokenCounter()public view returns(uint256){
        return s_tokenCounter;
    }
    function tokenUri(uint256 /*TokenId*/) public pure returns(string memory){
        return TOKEN_URI;
    }
}