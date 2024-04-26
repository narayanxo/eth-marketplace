document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(window.ethereum);
    } else {
        console.error("Please install MetaMask to use this DApp!");
    }
});

const contractAddress = '0xe9Df75402f6714719c2299c8F2d2930Fd85deD3b'; // replace with actual address
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            }
        ],
        "name": "listItem",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "itemId",
                "type": "uint256"
            }
        ],
        "name": "purchaseItem",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getItems",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address payable",
                        "name": "seller",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "title",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "sold",
                        "type": "bool"
                    }
                ],
                "internalType": "struct Marketplace.Item[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "items",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "address payable",
                "name": "seller",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "sold",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nextItemId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]; // replace with actual ABI
let marketplaceContract;

document.getElementById('connectWallet').addEventListener('click', connectWallet);

document.getElementById('listForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    await listItem(title, description, price);
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('price').value = '';
});

document.getElementById('purchaseForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const itemId = document.getElementById('itemId').value;
    const price = document.getElementById('purchasePrice').value;
    await purchaseItem(itemId, price);
    document.getElementById('itemId').value = '';
    document.getElementById('purchasePrice').value = '';
});

document.getElementById('displayItems').addEventListener('click', displayItems);

async function connectWallet() {
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        marketplaceContract = new web3.eth.Contract(contractABI, contractAddress);
        console.log("Wallet connected");
    } catch (error) {
        console.error("User denied account access", error);
    }
}

async function listItem(title, description, price) {
    const accounts = await web3.eth.getAccounts();
    const priceInWei = web3.utils.toWei(price, 'ether');
    try {
        await marketplaceContract.methods.listItem(title, description, priceInWei).send({ from: accounts[0] });
        console.log('Item listed successfully');
    } catch (error) {
        console.error('Error listing the item', error);
    }
}

async function purchaseItem(itemId, price) {
    const accounts = await web3.eth.getAccounts();
    const priceInWei = web3.utils.toWei(price, 'ether');
    try {
        await marketplaceContract.methods.purchaseItem(itemId).send({ from: accounts[0], value: priceInWei });
        console.log('Item purchased successfully');
    } catch (error) {
        console.error('Error purchasing the item', error);
    }
}

async function displayItems() {
    try {
        const items = await marketplaceContract.methods.getItems().call();
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = '';
        items.forEach(item => {
            const itemElement = document.createElement('li');
            itemElement.innerText = `ID: ${item.id} - Title: ${item.title} - Price: ${web3.utils.fromWei(item.price, 'ether')} ETH - Sold: ${item.sold}`;
            itemsList.appendChild(itemElement);
        });
    } catch (error) {
        console.error('Error fetching items', error);
    }
}

// Call connectWallet when the page loads to check if MetaMask is connected
connectWallet();
