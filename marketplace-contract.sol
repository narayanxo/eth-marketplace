// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {
    struct Item {
        uint id;
        address payable seller;
        string title;
        string description;
        uint price;
        bool sold;
    }

    Item[] public items;
    uint public nextItemId;

    function listItem(string calldata title, string calldata description, uint price) external {
        require(price > 0, "Price must be at least 1 wei");
        items.push(Item({
            id: nextItemId,
            seller: payable(msg.sender),
            title: title,
            description: description,
            price: price,
            sold: false
        }));
        nextItemId++;
    }

    function purchaseItem(uint itemId) external payable {
        Item storage item = items[itemId];
        require(msg.value == item.price, "Incorrect value");
        require(!item.sold, "Item already sold");

        item.seller.transfer(msg.value);
        item.sold = true;
    }

    function getItems() external view returns (Item[] memory) {
        return items;
    }
}
