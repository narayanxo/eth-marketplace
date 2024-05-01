document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(window.ethereum);
    } else {
        console.error("Please install MetaMask to use this DApp!");
    }
});

const contractAddress = '0xe9Df75402f6714719c2299c8F2d2930Fd85deD3b';
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
];
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
        // console.log("Wallet connected");
        showToast("Wallet connected", 'success');
    } catch (error) {
        showToast("User denied account access", 'error');
    }
}

async function listItem(title, description, price) {
    const accounts = await web3.eth.getAccounts();
    const priceInWei = web3.utils.toWei(price, 'ether');
    try {
        let response = await marketplaceContract.methods.listItem(title, description, priceInWei).send({ from: accounts[0] });
        showToast('Item listed successfully', 'success');
        updateTransactionLink(response.transactionHash);
        displayItems();
    } catch (error) {
        showToast('Error listing the item', 'error');
    }
}

async function purchaseItem(itemId, price) {
    const accounts = await web3.eth.getAccounts();
    const priceInWei = web3.utils.toWei(price, 'ether');
    try {
        let response = await marketplaceContract.methods.purchaseItem(itemId).send({ from: accounts[0], value: priceInWei });
        showToast('Item purchased successfully', 'success');
        updateTransactionLink(response.transactionHash);
    } catch (error) {
        showToast('Error purchasing the item', 'error');
    }
}

async function displayItems() {
    try {
        const items = await marketplaceContract.methods.getItems().call();
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = '';
        items.forEach(item => {
            const itemElement = document.createElement('li');
            itemElement.innerHTML = `
                <span class="item-section">ID: ${item.id}</span>
                <span class="item-section">Title: ${item.title}</span>
                <span class="item-section">Price: ${web3.utils.fromWei(item.price, 'ether')} ETH</span>
                <span class="item-section ${item.sold ? 'sold' : 'not-sold'}">Sold: ${item.sold}</span>
            `; // Use innerHTML to insert HTML content
            itemsList.appendChild(itemElement);
            showToast('Item listed successfully', 'success');
        });
    } catch (error) {
        showToast('Error displaying the item', 'error');
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type} show`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 500);
    }, 3000);
}

function updateTransactionLink(hash) {
    const hashLink = document.getElementById('transactionHashLink');
    const hashContainer = document.getElementById('transactionHashContainer');
    hashLink.href = `https://sepolia.etherscan.io/tx/${hash}`;
    hashLink.textContent = hash; 
    hashContainer.style.display = 'block';
}

// Call connectWallet when the page loads to check if MetaMask is connected
connectWallet();
