"use strict";
// TechStore Inventory System - Part1
// Day1: Data models and add item
let inventory = [];
let nextId = 1;
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
    renderTable();
    // clear form
    nameInp.value = "";
    qtyInp.value = "";
    priceInp.value = "";
    supplierInp.value = "";
    commentInp.value = "";
}
function renderTable() {
    const tableDiv = document.getElementById("inventoryTable");
    if (!tableDiv)
        return;
    if (inventory.length === 0) {
        tableDiv.innerHTML = "<p>No items</p>";
        return;
    }
    let html = `<table><tr><th>ID</th><th>Name</th><th>Category</th><th>Qty</th><th>Price</th><th>Supplier</th><th>Stock</th><th>Popular</th><th>Comment</th></tr>`;
    inventory.forEach(item => {
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
submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addItem();
});
// Initial dummy data
inventory = [
    { id: nextId++, name: "MacBook Pro", category: "Electronics", quantity: 5, price: 1999.99, supplier: "Apple", stockStatus: "In Stock", popular: "Yes", comment: "Best seller" },
    { id: nextId++, name: "Gaming Chair", category: "Furniture", quantity: 2, price: 299.99, supplier: "Secretlab", stockStatus: "Low Stock", popular: "No" },
];
renderTable();
