"use strict";
/*
  PROG2005 A2 Part 1 - Inventory
  Author: <Your Name>
  Student ID: <Your Student ID>
  Unit: PROG2005 Programming Mobile Systems
  Notes:
  - Data is stored in memory for the current browser session.
  - Core features: add, update by name, delete by name, search, filtering, CSV export.
*/
const categories = ["Electronics", "Furniture", "Clothing", "Tools", "Miscellaneous"];
const stockStatuses = ["In Stock", "Low Stock", "Out of Stock"];
const popularValues = ["Yes", "No"];
let items = [];
let searchTerm = "";
let onlyPopular = false;
let categoryFilter = "";
let sortType = "none";
let editingName = "";
const messageArea = document.getElementById("messageArea");
const itemIdInput = document.getElementById("itemId");
const itemNameInput = document.getElementById("itemName");
const categorySelect = document.getElementById("category");
const quantityInput = document.getElementById("quantity");
const priceInput = document.getElementById("price");
const supplierInput = document.getElementById("supplier");
const stockStatusSelect = document.getElementById("stockStatus");
const popularSelect = document.getElementById("popular");
const commentInput = document.getElementById("comment");
const searchInput = document.getElementById("searchInput");
const categoryFilterSelect = document.getElementById("categoryFilter");
const sortBySelect = document.getElementById("sortBy");
const inventoryBody = document.getElementById("inventoryBody");
const tableTitle = document.getElementById("tableTitle");
const totalItems = document.getElementById("totalItems");
const totalValue = document.getElementById("totalValue");
const lowStockCount = document.getElementById("lowStockCount");
const modal = document.getElementById("customConfirm");
const confirmMessage = document.getElementById("confirmMessage");
let confirmCallback = null;
function showMessage(message, isError = false) {
    messageArea.innerHTML = `<span style="color:${isError ? "#b91c1c" : "#166534"}">${message}</span>`;
    window.setTimeout(() => {
        messageArea.innerHTML = "";
    }, 3000);
}
function askConfirm(message) {
    confirmMessage.textContent = message;
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    return new Promise((resolve) => {
        confirmCallback = resolve;
    });
}
function closeConfirm(ok) {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    if (confirmCallback)
        confirmCallback(ok);
}
function addOption(select, text, value = text) {
    const option = document.createElement("option");
    option.text = text;
    option.value = value;
    select.add(option);
}
function populateDropdowns() {
    categorySelect.innerHTML = "";
    stockStatusSelect.innerHTML = "";
    popularSelect.innerHTML = "";
    categoryFilterSelect.innerHTML = "";
    categories.forEach((c) => addOption(categorySelect, c));
    stockStatuses.forEach((s) => addOption(stockStatusSelect, s));
    popularValues.forEach((p) => addOption(popularSelect, p));
    addOption(categoryFilterSelect, "All", "");
    categories.forEach((c) => addOption(categoryFilterSelect, c));
    categorySelect.value = "Electronics";
    stockStatusSelect.value = "In Stock";
    popularSelect.value = "No";
    categoryFilterSelect.value = "";
}
function getFormData() {
    return {
        id: itemIdInput.value.trim(),
        name: itemNameInput.value.trim(),
        category: categorySelect.value,
        quantity: Number(quantityInput.value),
        price: Number(priceInput.value),
        supplier: supplierInput.value.trim(),
        stockStatus: stockStatusSelect.value,
        popular: popularSelect.value,
        comment: commentInput.value.trim() || undefined
    };
}
function validateItem(item, mode, currentIndex = -1) {
    // All fields except comment are mandatory as per assessment brief.
    if (!item.id)
        return (showMessage("Item ID is required", true), false);
    if (!item.name)
        return (showMessage("Item name is required", true), false);
    if (quantityInput.value.trim() === "" || Number.isNaN(item.quantity) || item.quantity < 0) {
        return (showMessage("Quantity must be a non-negative number", true), false);
    }
    if (priceInput.value.trim() === "" || Number.isNaN(item.price) || item.price < 0) {
        return (showMessage("Price must be a non-negative number", true), false);
    }
    if (!item.supplier)
        return (showMessage("Supplier is required", true), false);
    const duplicateId = items.findIndex((x) => x.id.toLowerCase() === item.id.toLowerCase());
    if (mode === "add" && duplicateId !== -1)
        return (showMessage("Item ID must be unique", true), false);
    if (mode === "update" && duplicateId !== -1 && duplicateId !== currentIndex) {
        return (showMessage("Another record already uses this Item ID", true), false);
    }
    return true;
}
function clearForm() {
    itemIdInput.value = "";
    itemNameInput.value = "";
    quantityInput.value = "";
    priceInput.value = "";
    supplierInput.value = "";
    commentInput.value = "";
    categorySelect.value = "Electronics";
    stockStatusSelect.value = "In Stock";
    popularSelect.value = "No";
    editingName = "";
}
function updateStats() {
    totalItems.textContent = String(items.length);
    const value = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalValue.textContent = value.toFixed(2);
    const lowOrOut = items.filter((item) => item.stockStatus === "Low Stock" || item.stockStatus === "Out of Stock").length;
    lowStockCount.textContent = String(lowOrOut);
}
function filteredItems() {
    let output = [...items];
    if (onlyPopular)
        output = output.filter((item) => item.popular === "Yes");
    if (searchTerm)
        output = output.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (categoryFilter)
        output = output.filter((item) => item.category === categoryFilter);
    if (sortType === "price_asc")
        output.sort((a, b) => a.price - b.price);
    if (sortType === "price_desc")
        output.sort((a, b) => b.price - a.price);
    if (sortType === "qty_asc")
        output.sort((a, b) => a.quantity - b.quantity);
    if (sortType === "qty_desc")
        output.sort((a, b) => b.quantity - a.quantity);
    return output;
}
function renderTable(data) {
    // Rebuild table body from the current filtered list.
    inventoryBody.innerHTML = "";
    data.forEach((item) => {
        const row = inventoryBody.insertRow();
        const checkCell = row.insertCell();
        checkCell.innerHTML = `<input type="checkbox" class="item-check" data-id="${escapeHtml(item.id)}" ${item.selected ? "checked" : ""}>`;
        row.insertCell().textContent = item.id;
        row.insertCell().textContent = item.name;
        row.insertCell().textContent = item.category;
        row.insertCell().textContent = String(item.quantity);
        row.insertCell().textContent = `$${item.price.toFixed(2)}`;
        row.insertCell().textContent = item.supplier;
        const stockCell = row.insertCell();
        stockCell.textContent = item.stockStatus;
        if (item.stockStatus === "Low Stock")
            stockCell.className = "stock-low";
        if (item.stockStatus === "Out of Stock")
            stockCell.className = "stock-out";
        row.insertCell().textContent = item.popular;
        row.insertCell().textContent = item.comment || "-";
        const actionCell = row.insertCell();
        actionCell.innerHTML = `
      <button class="edit-btn" data-id="${escapeHtml(item.id)}">Edit</button>
      <button class="delete-btn danger" data-id="${escapeHtml(item.id)}">Delete</button>
    `;
    });
    bindRowEvents();
}
function refreshView() {
    const data = filteredItems();
    renderTable(data);
    updateStats();
    if (onlyPopular)
        tableTitle.textContent = "Popular Items";
    else if (searchTerm)
        tableTitle.textContent = `Search: ${searchTerm}`;
    else if (categoryFilter)
        tableTitle.textContent = `Category: ${categoryFilter}`;
    else
        tableTitle.textContent = "All Inventory";
}
function addItem() {
    // Add flow: validate, reject duplicates, then append record.
    const item = getFormData();
    if (!validateItem(item, "add"))
        return;
    const duplicateName = items.some((x) => x.name.toLowerCase() === item.name.toLowerCase());
    if (duplicateName)
        return showMessage("Item name already exists", true);
    items.push(item);
    clearForm();
    refreshView();
    showMessage(`Added item: ${item.name}`);
}
function updateByName() {
    // Update is intentionally performed by item name to match assignment rules.
    const targetName = editingName || itemNameInput.value.trim();
    if (!targetName)
        return showMessage("Enter item name to update", true);
    const index = items.findIndex((x) => x.name.toLowerCase() === targetName.toLowerCase());
    if (index === -1)
        return showMessage("Item not found", true);
    const next = getFormData();
    if (!validateItem(next, "update", index))
        return;
    const duplicateName = items.findIndex((x) => x.name.toLowerCase() === next.name.toLowerCase());
    if (duplicateName !== -1 && duplicateName !== index) {
        return showMessage("Another record already uses this item name", true);
    }
    items[index] = { ...next, selected: items[index].selected };
    clearForm();
    refreshView();
    showMessage(`Updated item: ${targetName}`);
}
async function deleteByName() {
    // Delete is intentionally performed by item name and requires confirmation.
    const targetName = itemNameInput.value.trim();
    if (!targetName)
        return showMessage("Enter item name to delete", true);
    const item = items.find((x) => x.name.toLowerCase() === targetName.toLowerCase());
    if (!item)
        return showMessage("Item not found", true);
    const ok = await askConfirm(`Delete '${item.name}'?`);
    if (!ok)
        return;
    items = items.filter((x) => x.id !== item.id);
    clearForm();
    refreshView();
    showMessage(`Deleted item: ${item.name}`);
}
async function deleteSelected() {
    const selected = items.filter((x) => x.selected);
    if (selected.length === 0)
        return showMessage("No selected items", true);
    const ok = await askConfirm(`Delete ${selected.length} selected item(s)?`);
    if (!ok)
        return;
    items = items.filter((x) => !x.selected);
    refreshView();
    showMessage(`Deleted ${selected.length} item(s)`);
}
function searchByName() {
    searchTerm = searchInput.value.trim();
    onlyPopular = false;
    categoryFilter = "";
    categoryFilterSelect.value = "";
    refreshView();
}
function showPopularOnly() {
    searchTerm = "";
    searchInput.value = "";
    categoryFilter = "";
    categoryFilterSelect.value = "";
    onlyPopular = true;
    refreshView();
}
function showAll() {
    searchTerm = "";
    searchInput.value = "";
    categoryFilter = "";
    categoryFilterSelect.value = "";
    onlyPopular = false;
    refreshView();
}
function exportCsv() {
    // Export the currently displayed rows (after search/filter/sort).
    const data = filteredItems();
    if (data.length === 0)
        return showMessage("No rows to export", true);
    const header = ["Item ID", "Item Name", "Category", "Quantity", "Price", "Supplier", "Stock Status", "Popular", "Comment"];
    const rows = data.map((item) => [
        csvEscape(item.id),
        csvEscape(item.name),
        csvEscape(item.category),
        csvEscape(item.quantity),
        csvEscape(item.price.toFixed(2)),
        csvEscape(item.supplier),
        csvEscape(item.stockStatus),
        csvEscape(item.popular),
        csvEscape(item.comment || "")
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage("CSV exported");
}
function csvEscape(value) {
    const text = String(value);
    if (/[",\n]/.test(text))
        return `"${text.replace(/"/g, '""')}"`;
    return text;
}
function escapeHtml(text) {
    return text.replace(/[&<>"]/g, (ch) => {
        if (ch === "&")
            return "&amp;";
        if (ch === "<")
            return "&lt;";
        if (ch === ">")
            return "&gt;";
        return "&quot;";
    });
}
function bindRowEvents() {
    const selectAll = document.getElementById("selectAll");
    selectAll.onchange = (event) => {
        const checked = event.target.checked;
        items.forEach((item) => {
            item.selected = checked;
        });
        refreshView();
    };
    document.querySelectorAll(".item-check").forEach((node) => {
        node.addEventListener("change", (event) => {
            const input = event.target;
            const id = input.dataset.id || "";
            const target = items.find((item) => item.id === id);
            if (target)
                target.selected = input.checked;
        });
    });
    document.querySelectorAll(".edit-btn").forEach((node) => {
        node.addEventListener("click", (event) => {
            const id = event.target.dataset.id || "";
            const target = items.find((item) => item.id === id);
            if (!target)
                return;
            itemIdInput.value = target.id;
            itemNameInput.value = target.name;
            categorySelect.value = target.category;
            quantityInput.value = String(target.quantity);
            priceInput.value = String(target.price);
            supplierInput.value = target.supplier;
            stockStatusSelect.value = target.stockStatus;
            popularSelect.value = target.popular;
            commentInput.value = target.comment || "";
            editingName = target.name;
            showMessage(`Editing item: ${target.name}`);
        });
    });
    document.querySelectorAll(".delete-btn").forEach((node) => {
        node.addEventListener("click", async (event) => {
            const id = event.target.dataset.id || "";
            const target = items.find((item) => item.id === id);
            if (!target)
                return;
            const ok = await askConfirm(`Delete '${target.name}'?`);
            if (!ok)
                return;
            items = items.filter((item) => item.id !== id);
            refreshView();
            showMessage(`Deleted item: ${target.name}`);
        });
    });
}
function seedData() {
    items = [
        { id: "E1001", name: "MacBook Pro", category: "Electronics", quantity: 5, price: 1999.99, supplier: "Apple", stockStatus: "In Stock", popular: "Yes", comment: "Best seller" },
        { id: "F1001", name: "Office Chair", category: "Furniture", quantity: 2, price: 299.99, supplier: "ErgoWorks", stockStatus: "Low Stock", popular: "No", comment: "Back support model" },
        { id: "T1001", name: "Hammer", category: "Tools", quantity: 0, price: 12.5, supplier: "Stanley", stockStatus: "Out of Stock", popular: "No" }
    ];
}
function bindTopEvents() {
    document.getElementById("submitBtn")?.addEventListener("click", (e) => { e.preventDefault(); addItem(); });
    document.getElementById("updateBtn")?.addEventListener("click", (e) => { e.preventDefault(); updateByName(); });
    document.getElementById("deleteBtn")?.addEventListener("click", (e) => { e.preventDefault(); deleteByName(); });
    document.getElementById("clearBtn")?.addEventListener("click", (e) => { e.preventDefault(); clearForm(); });
    document.getElementById("searchBtn")?.addEventListener("click", (e) => { e.preventDefault(); searchByName(); });
    document.getElementById("resetSearchBtn")?.addEventListener("click", (e) => { e.preventDefault(); showAll(); });
    document.getElementById("showAllBtn")?.addEventListener("click", (e) => { e.preventDefault(); showAll(); });
    document.getElementById("showPopularBtn")?.addEventListener("click", (e) => { e.preventDefault(); showPopularOnly(); });
    document.getElementById("exportBtn")?.addEventListener("click", (e) => { e.preventDefault(); exportCsv(); });
    document.getElementById("batchDeleteBtn")?.addEventListener("click", (e) => { e.preventDefault(); deleteSelected(); });
    categoryFilterSelect.addEventListener("change", () => {
        categoryFilter = categoryFilterSelect.value;
        onlyPopular = false;
        refreshView();
    });
    sortBySelect.addEventListener("change", () => {
        sortType = sortBySelect.value;
        refreshView();
    });
    document.getElementById("confirmYes")?.addEventListener("click", () => closeConfirm(true));
    document.getElementById("confirmNo")?.addEventListener("click", () => closeConfirm(false));
}
function init() {
    populateDropdowns();
    seedData();
    bindTopEvents();
    refreshView();
}
init();
