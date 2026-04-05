"use strict";
let inventory = [];
let nextId = 1;
let currentSearchTerm = "";
let showPopularOnly = false;
// DOM elements
const msgDiv = document.getElementById("messageArea");
const nameInp = document.getElementById("itemName");
const categorySel = document.getElementById("category");
const qtyInp = document.getElementById("quantity");
const priceInp = document.getElementById("price");
const supplierInp = document.getElementById("supplier");
const stockSel = document.getElementById("stockStatus");
const popularSel = document.getElementById("popular");
const commentInp = document.getElementById("comment");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");
const deleteBtn = document.getElementById("deleteBtn");
const clearBtn = document.getElementById("clearBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resetSearchBtn = document.getElementById("resetSearchBtn");
const showAllBtn = document.getElementById("showAllBtn");
const showPopularBtn = document.getElementById("showPopularBtn");
// Modal elements
const modal = document.getElementById("customConfirm");
const confirmMsg = document.getElementById("confirmMessage");
let confirmResolve = () => { };
function showConfirm(msg) {
    confirmMsg.innerText = msg;
    modal.style.display = "flex";
    return new Promise(resolve => { confirmResolve = resolve; });
}
function closeConfirm(confirmed) {
    modal.style.display = "none";
    confirmResolve(confirmed);
}
document.getElementById("confirmYes")?.addEventListener("click", () => closeConfirm(true));
document.getElementById("confirmNo")?.addEventListener("click", () => closeConfirm(false));
// Helper functions
function showMessage(msg, isError = false) {
    msgDiv.innerHTML = `<span style="color:${isError ? 'red' : 'green'}">${msg}</span>`;
    setTimeout(() => { msgDiv.innerHTML = ""; }, 3000);
}
function getFormData() {
    return {
        name: nameInp.value.trim(),
        category: categorySel.value,
        quantity: parseInt(qtyInp.value),
        price: parseFloat(priceInp.value),
        supplier: supplierInp.value.trim(),
        stockStatus: stockSel.value,
        popular: popularSel.value,
        comment: commentInp.value || undefined
    };
}
function validateForm() {
    if (!nameInp.value.trim()) {
        showMessage("Name required", true);
        return false;
    }
    if (isNaN(parseInt(qtyInp.value)) || parseInt(qtyInp.value) < 0) {
        showMessage("Qty >=0", true);
        return false;
    }
    if (isNaN(parseFloat(priceInp.value)) || parseFloat(priceInp.value) <= 0) {
        showMessage("Price >0", true);
        return false;
    }
    if (!supplierInp.value.trim()) {
        showMessage("Supplier required", true);
        return false;
    }
    return true;
}
function clearForm() {
    nameInp.value = "";
    qtyInp.value = "";
    priceInp.value = "";
    supplierInp.value = "";
    commentInp.value = "";
    categorySel.value = "Electronics";
    stockSel.value = "In Stock";
    popularSel.value = "No";
}
// CRUD
function addItem() {
    if (!validateForm())
        return;
    const newData = getFormData();
    if (inventory.some(item => item.name.toLowerCase() === newData.name.toLowerCase())) {
        showMessage("Duplicate name", true);
        return;
    }
    const newItem = { id: nextId++, ...newData };
    inventory.push(newItem);
    showMessage(`Added: ${newItem.name}`);
    clearForm();
    renderFilteredTable();
}
function updateItem() {
    const targetName = nameInp.value.trim();
    if (!targetName) {
        showMessage("Enter name to update", true);
        return;
    }
    const index = inventory.findIndex(i => i.name.toLowerCase() === targetName.toLowerCase());
    if (index === -1) {
        showMessage("Not found", true);
        return;
    }
    if (!validateForm())
        return;
    const newData = getFormData();
    inventory[index] = { id: inventory[index].id, ...newData };
    showMessage(`Updated: ${targetName}`);
    clearForm();
    renderFilteredTable();
}
async function deleteItem() {
    const targetName = nameInp.value.trim();
    if (!targetName) {
        showMessage("Enter name to delete", true);
        return;
    }
    const item = inventory.find(i => i.name.toLowerCase() === targetName.toLowerCase());
    if (!item) {
        showMessage("Not found", true);
        return;
    }
    const confirmed = await showConfirm(`Delete "${item.name}"?`);
    if (confirmed) {
        inventory = inventory.filter(i => i.id !== item.id);
        showMessage(`Deleted: ${item.name}`);
        clearForm();
        renderFilteredTable();
    }
    else {
        showMessage("Cancelled");
    }
}
// Filter & render
function getFilteredItems() {
    let filtered = [...inventory];
    if (showPopularOnly)
        filtered = filtered.filter(i => i.popular === "Yes");
    if (currentSearchTerm)
        filtered = filtered.filter(i => i.name.toLowerCase().includes(currentSearchTerm.toLowerCase()));
    return filtered;
}
function renderFilteredTable() {
    const items = getFilteredItems();
    const tableDiv = document.getElementById("inventoryTable");
    if (!tableDiv)
        return;
    if (items.length === 0) {
        tableDiv.innerHTML = "<p>No items match</p>";
        return;
    }
    let html = `<table><tr><th>ID</th><th>Name</th><th>Category</th><th>Qty</th><th>Price</th><th>Supplier</th><th>Stock</th><th>Popular</th><th>Comment</th></tr>`;
    items.forEach(item => {
        html += `<tr>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>${item.supplier}</td>
            <td>${item.stockStatus}</td>
            <td>${item.popular}</td>
            <td>${item.comment || '-'}</td>
        </tr>`;
    });
    html += `</table>`;
    tableDiv.innerHTML = html;
}
function searchItems() {
    currentSearchTerm = searchInput.value.trim();
    showPopularOnly = false;
    renderFilteredTable();
}
function resetSearch() {
    currentSearchTerm = "";
    searchInput.value = "";
    showPopularOnly = false;
    renderFilteredTable();
}
function showAll() {
    currentSearchTerm = "";
    searchInput.value = "";
    showPopularOnly = false;
    renderFilteredTable();
}
function showPopular() {
    currentSearchTerm = "";
    searchInput.value = "";
    showPopularOnly = true;
    renderFilteredTable();
}
// Event listeners
submitBtn.addEventListener("click", (e) => { e.preventDefault(); addItem(); });
updateBtn.addEventListener("click", (e) => { e.preventDefault(); updateItem(); });
deleteBtn.addEventListener("click", (e) => { e.preventDefault(); deleteItem(); });
clearBtn.addEventListener("click", clearForm);
searchBtn.addEventListener("click", searchItems);
resetSearchBtn.addEventListener("click", resetSearch);
showAllBtn.addEventListener("click", showAll);
showPopularBtn.addEventListener("click", showPopular);
// Initial data
inventory = [
    { id: nextId++, name: "MacBook Pro", category: "Electronics", quantity: 5, price: 1999.99, supplier: "Apple", stockStatus: "In Stock", popular: "Yes", comment: "Best seller" },
    { id: nextId++, name: "Gaming Chair", category: "Furniture", quantity: 2, price: 299.99, supplier: "Secretlab", stockStatus: "Low Stock", popular: "No" },
];
renderFilteredTable();
