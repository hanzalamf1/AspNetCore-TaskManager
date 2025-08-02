// menu1.js
// Authentication check
function redirectToLogin() {
    window.location.href = 'login.html';
}
function loadUserData() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
        try {
            const user = JSON.parse(userData);
            document.getElementById('userName').textContent = user.username || 'Kullanıcı';
            document.getElementById('remainingDays').textContent = user.remainingDays || '0';
        } catch (error) {
            redirectToLogin();
        }
    } else {
        redirectToLogin();
    }
}

// Pagination helpers
function paginate(array, page, pageSize) {
    const start = (page - 1) * pageSize;
    return array.slice(start, start + pageSize);
}
function renderPagination(total, page, pageSize, containerId, onPageChange) {
    const totalPages = Math.ceil(total / pageSize);
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = 'page-item' + (i === page ? ' active' : '');
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.textContent = i;
        a.onclick = (e) => { e.preventDefault(); onPageChange(i); };
        li.appendChild(a);
        container.appendChild(li);
    }
}

// Mock data for Products and Orders
globalThis._mockProducts = Array.from({length: 50}, (_, i) => ({
    date: '2024-07-12',
    time: '10:0' + (i%10),
    data1: 'Product ' + (i+1),
    data2: 'Category ' + ((i%5)+1),
    data3: 'Stock ' + (100-i)
}));
globalThis._mockOrders = Array.from({length: 37}, (_, i) => ({
    date: '2024-07-12',
    time: '11:1' + (i%10),
    data1: 'Order #' + (1000+i),
    data2: 'User ' + ((i%7)+1),
    data3: 'Total $' + (50+i)
}));

// Table renderers
function renderTableRows(data, tableId) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row.date}</td><td>${row.time}</td><td>${row.data1}</td><td>${row.data2}</td><td>${row.data3}</td>`;
        tbody.appendChild(tr);
    });
}

// Products Table (real API)
let productsPage = 1;
const productsPageSize = 20;
let productsTotal = 0;
async function loadProducts(page = 1) {
    productsPage = page;
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://localhost:7187/api/product?page=${page}&pageSize=${productsPageSize}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        productsTotal = data.total;
        const rows = (data.items || []).map(p => ([
            p.id,
            p.name,
            p.category,
            p.stock,
            p.createdAt ? p.createdAt.split('T')[0] : '-'
        ]));
        renderTableRowsV2(rows, 'productsTable');
        renderPagination(productsTotal, page, productsPageSize, 'productsPagination', loadProducts);
    } catch (err) {
        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = `<tr><td colspan="5" class="text-danger">${err.message}</td></tr>`;
    }
}
document.getElementById('refreshProducts').onclick = () => loadProducts(productsPage);

// Orders Table (real API)
let ordersPage = 1;
const ordersPageSize = 20;
let ordersTotal = 0;
async function loadOrders(page = 1) {
    ordersPage = page;
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://localhost:7187/api/order?page=${page}&pageSize=${ordersPageSize}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load orders');
        const data = await res.json();
        ordersTotal = data.total;
        const rows = (data.items || []).map(o => ([
            o.id,
            o.orderNumber,
            o.user && o.user.username ? o.user.username : o.userId,
            o.total,
            o.createdAt ? o.createdAt.split('T')[0] : '-'
        ]));
        renderTableRowsV2(rows, 'ordersTable');
        renderPagination(ordersTotal, page, ordersPageSize, 'ordersPagination', loadOrders);
    } catch (err) {
        const tbody = document.querySelector('#ordersTable tbody');
        tbody.innerHTML = `<tr><td colspan="5" class="text-danger">${err.message}</td></tr>`;
    }
}
document.getElementById('refreshOrders').onclick = () => loadOrders(ordersPage);

// Users Table (real API)
let usersData = [];
let usersPage = 1;
const usersPageSize = 20;
async function loadUsers(page = 1) {
    usersPage = page;
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://localhost:7187/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load users');
        usersData = await res.json();
        const paged = paginate(usersData, page, usersPageSize).map(u => ([
            u.id,
            u.username,
            u.email,
            u.phoneNumber,
            u.role || '-',
            u.taskCount || 0,
            u.remainingDays || '-'
        ]));
        renderTableRowsV2(paged, 'usersTable');
        renderPagination(usersData.length, page, usersPageSize, 'usersPagination', loadUsers);
    } catch (err) {
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = `<tr><td colspan="7" class="text-danger">${err.message}</td></tr>`;
    }
}
document.getElementById('refreshUsers').onclick = () => loadUsers(usersPage);

// Table renderer for new column structure
function renderTableRowsV2(data, tableId) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';
    data.forEach(rowArr => {
        const tr = document.createElement('tr');
        tr.innerHTML = rowArr.map(cell => `<td>${cell}</td>`).join('');
        tbody.appendChild(tr);
    });
}

function checkAdmin() {
    const userData = localStorage.getItem('userData');
    if (!userData) { redirectToHome(); return false; }
    try {
        const user = JSON.parse(userData);
        if (user.role !== 'admin') {
            showUnauthorizedMessage();
            setTimeout(redirectToHome, 1800);
            return false;
        }
    } catch { redirectToHome(); return false; }
    // Show content if admin
    document.getElementById('protectedContent').style.display = 'block';
    return true;
}
function showUnauthorizedMessage() {
    const msg = document.createElement('div');
    msg.textContent = 'Bu sayfaya sadece admin kullanıcılar erişebilir. Ana sayfaya yönlendiriliyorsunuz...';
    msg.style = 'position:fixed;top:30px;left:50%;transform:translateX(-50%);background:#fee2e2;color:#b91c1c;padding:1em 2em;border-radius:8px;z-index:9999;font-weight:600;box-shadow:0 2px 8px #0002;';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 1700);
}
function redirectToHome() {
    window.location.href = 'home.html';
}

// On page load
window.addEventListener('DOMContentLoaded', function() {
    if (!checkAdmin()) return;
    loadUserData();
    loadProducts();
    loadOrders();
    loadUsers();
}); 