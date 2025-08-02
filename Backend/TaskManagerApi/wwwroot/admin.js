// API URL
const API_URL = 'https://localhost:7187/api';

// GLOBAL STATE
let contacts = [];
let contactModal = null;

// On DOM ready
window.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadProducts();
    loadOrders();
    setupContactTableEvents();
    // setupSystemEvents(); // kaldırıldı
    // loadSystemStats(); // kaldırıldı
});

// -------------------- İLETİŞİM MESAJLARI -------------------- //
async function loadContacts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/contact`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            contacts = data.messages || [];
            renderContactsTable();
        } else {
            showContactsMessage('İletişim mesajları yüklenemedi.', 'danger');
        }
    } catch (err) {
        showContactsMessage('Bağlantı hatası!', 'danger');
    }
}

function renderContactsTable() {
    const tbody = document.querySelector('#contacts-table tbody');
    if (!tbody) return;
    if (contacts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Mesaj bulunamadı.</td></tr>`;
        return;
    }
    tbody.innerHTML = contacts.map(msg => `
        <tr>
            <td>${msg.id}</td>
            <td>${msg.name}</td>
            <td>${msg.email}</td>
            <td>${msg.phone}</td>
            <td>${msg.subject}</td>
            <td>${msg.message}</td>
            <td>${formatDate(msg.createdAt)}</td>
        </tr>
    `).join('');
}

function showContactsMessage(msg, type = 'info') {
    const el = document.getElementById('contacts-message');
    if (el) {
        el.innerHTML = `<div class="alert alert-${type} py-2 mb-2">${msg}</div>`;
        setTimeout(() => { el.innerHTML = ''; }, 4000);
    }
}

function getStatusText(status) {
    switch (status) {
        case 'pending': return 'Bekliyor';
        case 'read': return 'Okundu';
        case 'replied': return 'Yanıtlandı';
        case 'closed': return 'Kapalı';
        default: return status;
    }
}
function getStatusColor(status) {
    switch (status) {
        case 'pending': return 'warning';
        case 'read': return 'info';
        case 'replied': return 'success';
        case 'closed': return 'secondary';
        default: return 'light';
    }
}
function getPriorityText(priority) {
    switch (priority) {
        case 1: return 'Düşük';
        case 2: return 'Orta';
        case 3: return 'Yüksek';
        case 4: return 'Acil';
        default: return 'Bilinmiyor';
    }
}
function getPriorityColor(priority) {
    switch (priority) {
        case 1: return 'secondary';
        case 2: return 'info';
        case 3: return 'warning';
        case 4: return 'danger';
        default: return 'light';
    }
}
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR') + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

// -------------------- DETAY MODALI -------------------- //
function openContactModal(id) {
    const msg = contacts.find(c => c.id === id);
    if (!msg) return;
    // Modal HTML
    let modalHtml = `
    <div class="modal fade" id="contactDetailModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Mesaj Detayı</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-2"><b>Ad:</b> ${msg.name}</div>
            <div class="mb-2"><b>E-posta:</b> ${msg.email}</div>
            <div class="mb-2"><b>Telefon:</b> ${msg.phone}</div>
            <div class="mb-2"><b>Konu:</b> ${msg.subject}</div>
            <div class="mb-2"><b>Mesaj:</b><br><div class="border rounded p-2 bg-light">${msg.message}</div></div>
            <div class="mb-2"><b>Durum:</b> <span class="badge bg-${getStatusColor(msg.status)}">${getStatusText(msg.status)}</span></div>
            <div class="mb-2"><b>Öncelik:</b> <span class="badge bg-${getPriorityColor(msg.priority)}">${getPriorityText(msg.priority)}</span></div>
            <div class="mb-2"><b>Gönderim Tarihi:</b> ${formatDate(msg.createdAt)}</div>
            <div class="mb-2"><b>Admin Notu:</b> <textarea class="form-control" id="adminNoteInput" rows="2">${msg.adminNotes || ''}</textarea></div>
            <div class="mb-2"><b>Yanıt:</b> <textarea class="form-control" id="replyInput" rows="3">${msg.replyMessage || ''}</textarea></div>
            <div class="mb-2">
                <label class="form-label">Durum</label>
                <select class="form-select" id="statusSelect">
                    <option value="pending" ${msg.status === 'pending' ? 'selected' : ''}>Bekliyor</option>
                    <option value="read" ${msg.status === 'read' ? 'selected' : ''}>Okundu</option>
                    <option value="replied" ${msg.status === 'replied' ? 'selected' : ''}>Yanıtlandı</option>
                    <option value="closed" ${msg.status === 'closed' ? 'selected' : ''}>Kapalı</option>
                </select>
            </div>
            <div class="mb-2">
                <label class="form-label">Öncelik</label>
                <select class="form-select" id="prioritySelect">
                    <option value="1" ${msg.priority === 1 ? 'selected' : ''}>Düşük</option>
                    <option value="2" ${msg.priority === 2 ? 'selected' : ''}>Orta</option>
                    <option value="3" ${msg.priority === 3 ? 'selected' : ''}>Yüksek</option>
                    <option value="4" ${msg.priority === 4 ? 'selected' : ''}>Acil</option>
                </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Kapat</button>
            <button type="button" class="btn btn-info" onclick="saveAdminNote(${msg.id})">Notu Kaydet</button>
            <button type="button" class="btn btn-warning" onclick="updateContactStatus(${msg.id})">Durum/Öncelik</button>
            <button type="button" class="btn btn-success" onclick="replyContact(${msg.id})">Yanıtla</button>
          </div>
        </div>
      </div>
    </div>`;
    // Remove existing modal
    const oldModal = document.getElementById('contactDetailModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    contactModal = new bootstrap.Modal(document.getElementById('contactDetailModal'));
    contactModal.show();
}

async function saveAdminNote(id) {
    const note = document.getElementById('adminNoteInput').value;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/contact/${id}/notes`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: note })
    });
    showContactsMessage('Not kaydedildi.', 'success');
}

async function updateContactStatus(id) {
    const status = document.getElementById('statusSelect').value;
    const priority = parseInt(document.getElementById('prioritySelect').value);
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/contact/${id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    await fetch(`${API_URL}/contact/${id}/priority`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
    });
    showContactsMessage('Durum/öncelik güncellendi.', 'success');
    loadContacts();
    if (contactModal) contactModal.hide();
}

async function replyContact(id) {
    const reply = document.getElementById('replyInput').value;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/contact/${id}/reply`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyMessage: reply })
    });
    showContactsMessage('Yanıt gönderildi.', 'success');
    loadContacts();
    if (contactModal) contactModal.hide();
}

async function deleteContact(id) {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/contact/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    showContactsMessage('Mesaj silindi.', 'success');
    loadContacts();
}

function setupContactTableEvents() {
    // Tab değişiminde iletişim sekmesi seçilirse yükle
    const contactsTab = document.getElementById('contacts-tab');
    if (contactsTab) {
        contactsTab.addEventListener('shown.bs.tab', () => {
            loadContacts();
        });
    }
}
// Diğer sekmeler için benzer şekilde AJAX fonksiyonları eklenebilir. 

// --- KULLANICILAR SEKME ---
let users = [];
let userModal = null;

async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            users = await response.json();
            renderUsersTable();
        } else {
            showUsersMessage('Kullanıcılar yüklenemedi.', 'danger');
        }
    } catch (err) {
        showUsersMessage('Bağlantı hatası!', 'danger');
    }
}

function renderUsersTable() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;
    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Kullanıcı bulunamadı.</td></tr>`;
        return;
    }
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.id}</td>
            <td>${u.username}</td>
            <td>${u.email}</td>
            <td>${u.phoneNumber}</td>
            <td>${u.role}</td>
            <td>${u.taskCount || 0}</td>
            <td>${u.remainingDays}</td>
            <td>
                <button type="button" class="btn btn-success me-2" onclick="openUserModal(${u.id})">Düzenle</button>
                <button type="button" class="btn btn-danger" onclick="deleteUser(${u.id})">Sil</button>
            </td>
        </tr>
    `).join('');
}

function showUsersMessage(msg, type = 'info') {
    const el = document.getElementById('users-message');
    if (el) {
        el.innerHTML = `<div class="alert alert-${type} py-2 mb-2">${msg}</div>`;
        setTimeout(() => { el.innerHTML = ''; }, 4000);
    }
}

// Kullanıcı düzenleme modal'ı
function openUserModal(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const modalHtml = `
        <div class="modal fade" id="userEditModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Kullanıcı Düzenle</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="userEditForm">
                            <div class="mb-3">
                                <label class="form-label">Kullanıcı Adı</label>
                                <input type="text" class="form-control" id="editUsername" value="${user.username}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">E-posta</label>
                                <input type="email" class="form-control" id="editEmail" value="${user.email}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Telefon</label>
                                <input type="text" class="form-control" id="editPhone" value="${user.phoneNumber}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Rol</label>
                                <select class="form-select" id="editRole">
                                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>Kullanıcı</option>
                                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Kalan Gün</label>
                                <select class="form-select" id="editRemainingDays">
                                    <option value="15" ${user.remainingDays == 15 ? 'selected' : ''}>15 Gün</option>
                                    <option value="30" ${user.remainingDays == 30 ? 'selected' : ''}>30 Gün</option>
                                    <option value="90" ${user.remainingDays == 90 ? 'selected' : ''}>90 Gün</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Yeni Şifre (Boş bırakın değiştirmek istemiyorsanız)</label>
                                <input type="password" class="form-control" id="editPassword" placeholder="Yeni şifre">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Kapat</button>
                        <button type="button" class="btn btn-success me-2" onclick="saveUser(${user.id})">Kaydet</button>
                        <button type="button" class="btn btn-danger" onclick="deleteUserFromModal(${user.id})">Sil</button>
                    </div>
                </div>
            </div>
        </div>`;
    // Remove existing modal
    const oldModal = document.getElementById('userEditModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    userModal = new bootstrap.Modal(document.getElementById('userEditModal'));
    userModal.show();
}
window.deleteUserFromModal = async function(id) {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
        showUsersMessage('Kullanıcı başarıyla silindi.', 'success');
        loadUsers();
        if (userModal) userModal.hide();
    } else {
        const error = await response.json();
        showUsersMessage(error.message || 'Kullanıcı silinirken hata oluştu.', 'danger');
    }
}

async function saveUser(id) {
    try {
        const formData = {
            username: document.getElementById('editUsername').value,
            email: document.getElementById('editEmail').value,
            phoneNumber: document.getElementById('editPhone').value,
            role: document.getElementById('editRole').value,
            remainingDays: parseInt(document.getElementById('editRemainingDays').value),
            password: document.getElementById('editPassword').value || null
        };
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/users/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showUsersMessage('Kullanıcı başarıyla güncellendi.', 'success');
            loadUsers();
            if (userModal) userModal.hide();
            // Otomatik logout ve mesaj: Eğer güncellenen kullanıcı şu anki kullanıcıysa
            const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
            const data = await response.json(); // response.json() ile yeni kullanıcıyı al
            if ((id && currentUser && currentUser.id == id) || (!id && data.user && data.user.id == currentUser.id)) {
                // Güncellenen kullanıcı şu anki kullanıcıysa
                if (data.user) {
                    localStorage.setItem('userData', JSON.stringify(data.user));
                    // Eğer yeni rol admin değilse veya user ise logout yap
                    if (data.user.role !== 'admin') {
                        localStorage.removeItem('token');
                        localStorage.removeItem('userData');
                        const info = document.createElement('div');
                        info.textContent = 'Rolünüz değişti, lütfen tekrar giriş yapın.';
                        info.style = 'position:fixed;top:30px;left:50%;transform:translateX(-50%);background:#fee2e2;color:#b91c1c;padding:1em 2em;border-radius:8px;z-index:9999;font-weight:600;box-shadow:0 2px 8px #0002;';
                        document.body.appendChild(info);
                        setTimeout(() => { info.remove(); window.location.href = 'login.html'; }, 1800);
                    } else {
                        const info = document.createElement('div');
                        info.textContent = 'Rolünüz başarıyla güncellendi.';
                        info.style = 'position:fixed;top:30px;left:50%;transform:translateX(-50%);background:#d1fae5;color:#065f46;padding:1em 2em;border-radius:8px;z-index:9999;font-weight:600;box-shadow:0 2px 8px #0002;';
                        document.body.appendChild(info);
                        setTimeout(() => info.remove(), 1700);
                    }
                }
            }
        } else {
            const error = await response.json();
            showUsersMessage(error.message || 'Kullanıcı güncellenirken hata oluştu.', 'danger');
        }
    } catch (err) {
        showUsersMessage('Bağlantı hatası!', 'danger');
    }
}

async function deleteUser(id) {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            showUsersMessage('Kullanıcı başarıyla silindi.', 'success');
            loadUsers();
        } else {
            const error = await response.json();
            showUsersMessage(error.message || 'Kullanıcı silinirken hata oluştu.', 'danger');
        }
    } catch (err) {
        showUsersMessage('Bağlantı hatası!', 'danger');
    }
}

// --- GÖREVLER SEKME ---
let tasks = [];
let taskModal = null;

async function loadTasks() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            tasks = await response.json();
            renderTasksTable();
        } else {
            showTasksMessage('Görevler yüklenemedi.', 'danger');
        }
    } catch (err) {
        showTasksMessage('Bağlantı hatası!', 'danger');
    }
}

function renderTasksTable() {
    const tbody = document.querySelector('#tasks-table tbody');
    if (!tbody) return;
    if (tasks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Görev bulunamadı.</td></tr>`;
        return;
    }
    tbody.innerHTML = tasks.map(t => `
        <tr>
            <td>${t.id}</td>
            <td>${t.title}</td>
            <td>${t.description || ''}</td>
            <td>${t.isCompleted ? '<span class=\'badge bg-success\'>Evet</span>' : '<span class=\'badge bg-warning\'>Hayır</span>'}</td>
            <td>${t.username || '-'}</td>
            <td>
                <button type="button" class="btn btn-success me-2" onclick="openTaskModal(${t.id})">Düzenle</button>
                <button type="button" class="btn btn-danger" onclick="deleteTask(${t.id})">Sil</button>
            </td>
        </tr>
    `).join('');
}

function showTasksMessage(msg, type = 'info') {
    const el = document.getElementById('tasks-message');
    if (el) {
        el.innerHTML = `<div class="alert alert-${type} py-2 mb-2">${msg}</div>`;
        setTimeout(() => { el.innerHTML = ''; }, 4000);
    }
}

// Görev düzenleme modal'ı
function openTaskModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    let userOptions = users.map(u => `<option value="${u.id}" ${task.userId == u.id ? 'selected' : ''}>${u.username} (${u.email})</option>`).join('');
    const modalHtml = `
    <div class="modal fade" id="taskModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Görev Düzenle</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-2">
              <label class="form-label">Başlık</label>
              <input type="text" class="form-control" id="editTaskTitle" value="${task.title}" />
            </div>
            <div class="mb-2">
              <label class="form-label">Açıklama</label>
              <textarea class="form-control" id="editTaskDescription">${task.description || ''}</textarea>
            </div>
            <div class="mb-2">
              <label class="form-label">Öncelik</label>
              <input type="text" class="form-control" id="editTaskPriority" value="${task.priority || ''}" />
            </div>
            <div class="mb-2">
              <label class="form-label">Bitiş Tarihi</label>
              <input type="date" class="form-control" id="editTaskDueDate" value="${task.dueDate ? task.dueDate.split('T')[0] : ''}" />
            </div>
            <div class="mb-2">
              <label class="form-label">Kullanıcı</label>
              <select class="form-select" id="editTaskUserId">${userOptions}</select>
            </div>
            <div class="mb-2">
              <label class="form-label">Tamamlandı</label>
              <select class="form-select" id="editTaskCompleted">
                <option value="false" ${!task.isCompleted ? 'selected' : ''}>Hayır</option>
                <option value="true" ${task.isCompleted ? 'selected' : ''}>Evet</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Kapat</button>
            <button type="button" class="btn btn-success me-2" onclick="saveTask(${task.id})">Kaydet</button>
            <button type="button" class="btn btn-danger" onclick="deleteTaskFromModal(${task.id})">Sil</button>
          </div>
        </div>
      </div>
    </div>`;
    document.getElementById('taskModalContainer').innerHTML = modalHtml;
    taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
    taskModal.show();
}
window.deleteTaskFromModal = async function(id) {
    if (!confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/admin/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        showTasksMessage('Görev silindi.', 'success');
        loadTasks();
        if (taskModal) taskModal.hide();
    } else {
        showTasksMessage('Görev silinirken hata oluştu.', 'danger');
    }
}

async function saveTask(id) {
    try {
        const formData = {
            title: document.getElementById('editTaskTitle').value,
            description: document.getElementById('editTaskDescription').value,
            isCompleted: document.getElementById('editTaskCompleted').value === 'true',
            priority: document.getElementById('editTaskPriority').value,
            dueDate: document.getElementById('editTaskDueDate').value || null,
            userId: parseInt(document.getElementById('editTaskUserId').value) // Kullanıcı ID'sini de ekleyelim
        };
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showTasksMessage('Görev başarıyla güncellendi.', 'success');
            loadTasks();
            if (taskModal) taskModal.hide();
        } else {
            const error = await response.json();
            showTasksMessage(error.message || 'Görev güncellenirken hata oluştu.', 'danger');
        }
    } catch (err) {
        showTasksMessage('Bağlantı hatası!', 'danger');
    }
}

async function deleteTask(id) {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            showTasksMessage('Görev başarıyla silindi.', 'success');
            loadTasks();
        } else {
            const error = await response.json();
            showTasksMessage(error.message || 'Görev silinirken hata oluştu.', 'danger');
        }
    } catch (err) {
        showTasksMessage('Bağlantı hatası!', 'danger');
    }
}

// --- BİLDİRİMLER SEKME ---
let notifications = [];

async function loadNotifications() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            notifications = data.notifications || [];
            renderNotificationsTable();
        } else {
            showNotificationsMessage('Bildirimler yüklenemedi.', 'danger');
        }
    } catch (err) {
        showNotificationsMessage('Bağlantı hatası!', 'danger');
    }
}

function renderNotificationsTable() {
    const tbody = document.querySelector('#notifications-table tbody');
    if (!tbody) return;
    if (notifications.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Bildirim bulunamadı.</td></tr>`;
        return;
    }
    tbody.innerHTML = notifications.map(n => `
        <tr>
            <td>${n.id}</td>
            <td>${n.title}</td>
            <td>${n.message}</td>
            <td><span class="badge bg-${getNotificationColor(n.type)}">${n.type}</span></td>
            <td>${n.username || '-'}</td>
            <td><span class="badge bg-${n.isRead ? 'success' : 'warning'}">${n.isRead ? 'Okundu' : 'Okunmadı'}</span></td>
            <td>${formatDate(n.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-outline-info" onclick="viewNotificationDetails(${n.id})"><i class="fa fa-eye"></i></button>
            </td>
        </tr>
    `).join('');
}

function showNotificationsMessage(msg, type = 'info') {
    const el = document.getElementById('notifications-message');
    if (el) {
        el.innerHTML = `<div class="alert alert-${type} py-2 mb-2">${msg}</div>`;
        setTimeout(() => { el.innerHTML = ''; }, 4000);
    }
}
function getNotificationColor(type) {
    switch (type) {
        case 'success': return 'success';
        case 'error': return 'danger';
        case 'warning': return 'warning';
        case 'info': return 'info';
        default: return 'secondary';
    }
}

// Bildirim detayları görüntüleme
function viewNotificationDetails(id) {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;
    
    const modalHtml = `
        <div class="modal fade" id="notificationDetailModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Bildirim Detayı</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <strong>Başlık:</strong> ${notification.title}
                        </div>
                        <div class="mb-3">
                            <strong>Mesaj:</strong><br>
                            <div class="border rounded p-2 bg-light">${notification.message}</div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <strong>Tür:</strong> <span class="badge bg-${getNotificationColor(notification.type)}">${notification.type}</span>
                            </div>
                            <div class="col-md-6">
                                <strong>Durum:</strong> <span class="badge bg-${notification.isRead ? 'success' : 'warning'}">${notification.isRead ? 'Okundu' : 'Okunmadı'}</span>
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-6">
                                <strong>Kullanıcı:</strong> ${notification.username || '-'}
                            </div>
                            <div class="col-md-6">
                                <strong>Tarih:</strong> ${formatDate(notification.createdAt)}
                            </div>
                        </div>
                        ${notification.relatedEntityType ? `
                        <div class="row mt-2">
                            <div class="col-md-6">
                                <strong>İlgili Varlık:</strong> ${notification.relatedEntityType}
                            </div>
                            <div class="col-md-6">
                                <strong>Varlık ID:</strong> ${notification.relatedEntityId || '-'}
                            </div>
                        </div>
                        ` : ''}
                        ${notification.actionUrl ? `
                        <div class="mt-2">
                            <strong>Eylem URL:</strong> ${notification.actionUrl}
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Kapat</button>
                    </div>
                </div>
            </div>
        </div>`;
    
    // Remove existing modal
    const oldModal = document.getElementById('notificationDetailModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('notificationDetailModal'));
    modal.show();
} 

// -------------------- PRODUCTS -------------------- //
let products = [];
let productModal = null;
async function loadProducts() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/product?page=1&pageSize=100`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Ürünler yüklenemedi.');
        const data = await res.json();
        products = data.items || [];
        renderProductsTable();
    } catch (err) {
        showProductsMessage(err.message, 'danger');
    }
}
function renderProductsTable() {
    const tbody = document.querySelector('#products-table tbody');
    if (!tbody) return;
    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Ürün bulunamadı.</td></tr>`;
        return;
    }
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.stock}</td>
            <td>${p.createdAt ? new Date(p.createdAt).toLocaleString('tr-TR') : '-'}</td>
            <td>
                <button type="button" class="btn btn-success me-2" onclick="openProductModal(${p.id})">Düzenle</button>
                <button type="button" class="btn btn-danger" onclick="deleteProduct(${p.id})">Sil</button>
            </td>
        </tr>
    `).join('');
}
function showProductsMessage(msg, type = 'info') {
    const el = document.getElementById('products-message');
    if (el) {
        el.innerHTML = `<div class="alert alert-${type} py-2 mb-2">${msg}</div>`;
        setTimeout(() => { el.innerHTML = ''; }, 4000);
    }
}
function openProductModal(id) {
    let p = id ? products.find(x => x.id === id) : { id: 0, name: '', category: '', stock: 0 };
    const modalHtml = `
    <div class="modal fade" id="productModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${id ? 'Ürünü Düzenle' : 'Ürün Ekle'}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-2">
              <label class="form-label">Ad</label>
              <input type="text" class="form-control" id="productName" value="${p.name || ''}" />
            </div>
            <div class="mb-2">
              <label class="form-label">Kategori</label>
              <input type="text" class="form-control" id="productCategory" value="${p.category || ''}" />
            </div>
            <div class="mb-2">
              <label class="form-label">Stok</label>
              <input type="number" class="form-control" id="productStock" value="${p.stock || 0}" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Kapat</button>
            <button type="button" class="btn btn-success me-2" onclick="saveProduct(${id || 0})">Kaydet</button>
            ${id ? `<button type="button" class="btn btn-danger" onclick="deleteProductFromModal(${id})">Sil</button>` : ''}
          </div>
        </div>
      </div>
    </div>`;
    document.getElementById('productModalContainer').innerHTML = modalHtml;
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    productModal.show();
}
async function saveProduct(id) {
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const stock = parseInt(document.getElementById('productStock').value);
    const token = localStorage.getItem('token');
    if (!name) { showProductsMessage('Ad zorunlu.', 'danger'); return; }
    let res;
    if (id) {
        res = await fetch(`${API_URL}/product/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category, stock })
        });
    } else {
        res = await fetch(`${API_URL}/product`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category, stock })
        });
    }
    if (res.ok) {
        showProductsMessage('Ürün kaydedildi.', 'success');
        loadProducts();
        if (productModal) productModal.hide();
    } else {
        showProductsMessage('Hata oluştu.', 'danger');
    }
}
async function deleteProduct(id) {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/product/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        showProductsMessage('Ürün silindi.', 'success');
        loadProducts();
    } else {
        showProductsMessage('Hata oluştu.', 'danger');
    }
}
document.getElementById('addProductBtn').onclick = () => openProductModal(0);

window.deleteProductFromModal = async function(id) {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/product/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        showProductsMessage('Ürün silindi.', 'success');
        loadProducts();
        if (productModal) productModal.hide();
    } else {
        showProductsMessage('Hata oluştu.', 'danger');
    }
}

// -------------------- ORDERS -------------------- //
let orders = [];
let orderModal = null;
async function loadOrders() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/order?page=1&pageSize=100`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Siparişler yüklenemedi.');
        const data = await res.json();
        orders = data.items || [];
        renderOrdersTable();
    } catch (err) {
        showOrdersMessage(err.message, 'danger');
    }
}
function renderOrdersTable() {
    const tbody = document.querySelector('#orders-table tbody');
    if (!tbody) return;
    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Sipariş bulunamadı.</td></tr>`;
        return;
    }
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>${o.id}</td>
            <td>${o.orderNumber}</td>
            <td>${o.user && o.user.username ? o.user.username : o.userId}</td>
            <td>${o.total}</td>
            <td>${o.createdAt ? new Date(o.createdAt).toLocaleString('tr-TR') : '-'}</td>
            <td>
                <button type="button" class="btn btn-success me-2" onclick="openOrderModal(${o.id})">Düzenle</button>
                <button type="button" class="btn btn-danger" onclick="deleteOrder(${o.id})">Sil</button>
            </td>
        </tr>
    `).join('');
}
function showOrdersMessage(msg, type = 'info') {
    const el = document.getElementById('orders-message');
    if (el) {
        el.innerHTML = `<div class="alert alert-${type} py-2 mb-2">${msg}</div>`;
        setTimeout(() => { el.innerHTML = ''; }, 4000);
    }
}
function openOrderModal(id) {
    let o = id ? orders.find(x => x.id === id) : { id: 0, orderNumber: '', userId: '', total: 0 };
    // Kullanıcı select2 için options hazırla
    let userOptions = users.map(u => `<option value="${u.id}" ${o.userId == u.id ? 'selected' : ''}>${u.username} (${u.email})</option>`).join('');
    const modalHtml = `
    <div class="modal fade" id="orderModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${id ? 'Siparişi Düzenle' : 'Sipariş Ekle'}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-2">
              <label class="form-label">Sipariş No</label>
              <input type="text" class="form-control" id="orderNumber" value="${o.orderNumber || ''}" />
            </div>
            <div class="mb-2">
              <label class="form-label">Kullanıcı</label>
              <select class="form-select" id="orderUserId" style="width:100%">${userOptions}</select>
            </div>
            <div class="mb-2">
              <label class="form-label">Tutar</label>
              <input type="number" class="form-control" id="orderTotal" value="${o.total || 0}" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Kapat</button>
            <button type="button" class="btn btn-success me-2" onclick="saveOrder(${id || 0})">Kaydet</button>
            ${id ? `<button type="button" class="btn btn-danger" onclick="deleteOrderFromModal(${id})">Sil</button>` : ''}
          </div>
        </div>
      </div>
    </div>`;
    document.getElementById('orderModalContainer').innerHTML = modalHtml;
    orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
    orderModal.show();
    // Select2 başlat
    if (window.$ && window.$.fn && window.$.fn.select2) {
      $('#orderUserId').select2({
        dropdownParent: $('#orderModal'),
        width: '100%',
        placeholder: 'Kullanıcı ara...',
        allowClear: true
      });
    }
}
async function saveOrder(id) {
    const orderNumber = document.getElementById('orderNumber').value.trim();
    const userId = parseInt(document.getElementById('orderUserId').value);
    const total = parseFloat(document.getElementById('orderTotal').value);
    const token = localStorage.getItem('token');
    if (!orderNumber || !userId) { showOrdersMessage('Sipariş No ve Kullanıcı ID zorunlu.', 'danger'); return; }
    let res;
    if (id) {
        res = await fetch(`${API_URL}/order/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderNumber, userId, total })
        });
    } else {
        res = await fetch(`${API_URL}/order`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderNumber, userId, total })
        });
    }
    if (res.ok) {
        showOrdersMessage('Sipariş kaydedildi.', 'success');
        loadOrders();
        if (orderModal) orderModal.hide();
    } else {
        showOrdersMessage('Hata oluştu.', 'danger');
    }
}
async function deleteOrder(id) {
    if (!confirm('Bu siparişi silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/order/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        showOrdersMessage('Sipariş silindi.', 'success');
        loadOrders();
    } else {
        showOrdersMessage('Hata oluştu.', 'danger');
    }
}
document.getElementById('addOrderBtn').onclick = () => openOrderModal(0);

window.deleteOrderFromModal = async function(id) {
    if (!confirm('Bu siparişi silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/order/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        showOrdersMessage('Sipariş silindi.', 'success');
        loadOrders();
        if (orderModal) orderModal.hide();
    } else {
        showOrdersMessage('Hata oluştu.', 'danger');
    }
}

// Tab değişiminde ilgili verileri yükle
const adminTabs = document.getElementById('adminTabs');
if (adminTabs) {
    adminTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('button[data-bs-toggle="tab"]');
        if (!tab) return;
        if (tab.id === 'products-tab') loadProducts();
        if (tab.id === 'orders-tab') loadOrders();
        if (tab.id === 'tasks-tab') loadTasks();
    });
}

// --- SIGNALR: İletişim Mesajı Bildirimi ---
let signalRConnection;
async function setupSignalRForContacts() {
    try {
        const token = localStorage.getItem('token');
        signalRConnection = new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:7187/notificationHub', {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();
        signalRConnection.on('ReceiveNotification', function(notification) {
            if (notification.relatedEntityType === 'contact') {
                showContactToast(notification.title, notification.message);
                loadContacts();
            }
        });
        await signalRConnection.start();
        console.log('SignalR connected for contacts');
    } catch (err) {
        console.log('SignalR connection failed:', err);
    }
}
setupSignalRForContacts();

function showContactToast(title, message) {
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
        <div class="notification-toast-header">
            <div class="notification-toast-title">${title}</div>
            <button class="notification-toast-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="notification-toast-message">${message}</div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// -------------------- SİSTEM YÖNETİMİ -------------------- //
function setupSystemEvents() {
    document.getElementById('checkDeadlinesBtn')?.addEventListener('click', checkDeadlines);
    document.getElementById('sendDailyReportBtn')?.addEventListener('click', sendDailyReport);
    document.getElementById('sendWeeklyReportBtn')?.addEventListener('click', sendWeeklyReport);
}

async function loadSystemStats() {
    try {
        const token = localStorage.getItem('token');
        
        // Load users count
        const usersResponse = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (usersResponse.ok) {
            const users = await usersResponse.json();
            document.getElementById('totalUsers').textContent = users.length;
        }
        
        // Load tasks count
        const tasksResponse = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (tasksResponse.ok) {
            const tasks = await tasksResponse.json();
            document.getElementById('totalTasks').textContent = tasks.length;
            
            // Count overdue tasks
            const now = new Date();
            const overdueCount = tasks.filter(task => 
                !task.isCompleted && 
                task.dueDate && 
                new Date(task.dueDate) < now
            ).length;
            document.getElementById('overdueTasks').textContent = overdueCount;
        }
        
        // Load notifications count
        const notificationsResponse = await fetch(`${API_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (notificationsResponse.ok) {
            const notifications = await notificationsResponse.json();
            document.getElementById('totalNotifications').textContent = notifications.length;
        }
    } catch (err) {
        console.error('Error loading system stats:', err);
    }
}

async function checkDeadlines() {
    try {
        const button = document.getElementById('checkDeadlinesBtn');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Kontrol Ediliyor...';
        button.disabled = true;
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/system/check-deadlines`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            showSystemMessage('Deadline kontrolü başarıyla tamamlandı.', 'success');
        } else {
            showSystemMessage('Deadline kontrolü sırasında hata oluştu.', 'danger');
        }
    } catch (err) {
        showSystemMessage('Bağlantı hatası!', 'danger');
    } finally {
        const button = document.getElementById('checkDeadlinesBtn');
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

async function sendDailyReport() {
    try {
        const button = document.getElementById('sendDailyReportBtn');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Gönderiliyor...';
        button.disabled = true;
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/system/send-daily-report`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            showSystemMessage('Günlük rapor başarıyla gönderildi.', 'success');
        } else {
            showSystemMessage('Günlük rapor gönderimi sırasında hata oluştu.', 'danger');
        }
    } catch (err) {
        showSystemMessage('Bağlantı hatası!', 'danger');
    } finally {
        const button = document.getElementById('sendDailyReportBtn');
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

async function sendWeeklyReport() {
    try {
        const button = document.getElementById('sendWeeklyReportBtn');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Gönderiliyor...';
        button.disabled = true;
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/system/send-weekly-report`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            showSystemMessage('Haftalık rapor başarıyla gönderildi.', 'success');
        } else {
            showSystemMessage('Haftalık rapor gönderimi sırasında hata oluştu.', 'danger');
        }
    } catch (err) {
        showSystemMessage('Bağlantı hatası!', 'danger');
    } finally {
        const button = document.getElementById('sendWeeklyReportBtn');
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

function showSystemMessage(msg, type = 'info') {
    const el = document.getElementById('system-message');
    if (el) {
        el.innerHTML = `<div class="alert alert-${type} py-2 mb-2">${msg}</div>`;
        setTimeout(() => { el.innerHTML = ''; }, 4000);
    }
} 

// === MENU2 KATEGORİLERİ ===

// --- Butonlar ---
const buttonModal = new bootstrap.Modal(document.getElementById('buttonModal'));
const buttonForm = document.getElementById('buttonForm');
const buttonsTable = document.getElementById('buttons-table').querySelector('tbody');
const buttonsMsg = document.getElementById('buttons-message');
document.getElementById('addButtonBtn').onclick = () => {
    buttonForm.reset();
    document.getElementById('button-id').value = '';
    document.getElementById('buttonDeleteBtn').style.display = 'none';
    buttonModal.show();
};
buttonForm.onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById('button-id').value;
    const data = {
        id: id || 0,
        date: document.getElementById('button-date').value,
        name: document.getElementById('button-name').value,
        type: document.getElementById('button-type').value,
        color: document.getElementById('button-color').value,
        price: parseFloat(document.getElementById('button-price').value)
    };
    const url = id ? '/api/menu2/UpdateButton' : '/api/menu2/AddButton';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) {
        buttonModal.hide();
        loadButtons();
        buttonsMsg.textContent = id ? 'Kayıt güncellendi.' : 'Kayıt eklendi.';
        buttonsMsg.className = 'form-message success';
    } else {
        buttonsMsg.textContent = 'Hata oluştu.';
        buttonsMsg.className = 'form-message';
    }
};
async function loadButtons() {
    buttonsTable.innerHTML = '<tr><td colspan="7">Yükleniyor...</td></tr>';
    const res = await fetch('/api/menu2/GetButtons');
    const data = await res.json();
    buttonsTable.innerHTML = data.map(b => `
        <tr>
            <td>${b.id}</td>
            <td>${b.date ? b.date.replace('T',' ').slice(0,16) : ''}</td>
            <td>${b.name}</td>
            <td>${b.type}</td>
            <td>${b.color}</td>
            <td>${b.price} TL</td>
            <td>
                <button type="button" class="btn btn-success me-2" onclick="editButton(${b.id})">Düzenle</button>
                <button type="button" class="btn btn-danger" onclick="deleteButton(${b.id})">Sil</button>
            </td>
        </tr>`).join('') || '<tr><td colspan="7">Kayıt yok.</td></tr>';
}
window.editButton = async function(id) {
    const res = await fetch('/api/menu2/GetButton?id=' + id);
    if (!res.ok) return;
    const b = await res.json();
    document.getElementById('button-id').value = b.id;
    document.getElementById('button-date').value = b.date ? b.date.slice(0,16) : '';
    document.getElementById('button-name').value = b.name;
    document.getElementById('button-type').value = b.type;
    document.getElementById('button-color').value = b.color;
    document.getElementById('button-price').value = b.price;
    document.getElementById('buttonDeleteBtn').style.display = '';
    document.getElementById('buttonDeleteBtn').onclick = async function() {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        const res = await fetch('/api/menu2/DeleteButton?id=' + id, { method: 'DELETE' });
        if (res.ok) {
            buttonModal.hide();
            loadButtons();
        }
    };
    buttonModal.show();
};
window.deleteButton = async function(id) {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    const res = await fetch('/api/menu2/DeleteButton?id=' + id, { method: 'DELETE' });
    if (res.ok) loadButtons();
};
document.addEventListener('DOMContentLoaded', loadButtons);

// --- Laptoplar ---
const laptopModal = new bootstrap.Modal(document.getElementById('laptopModal'));
const laptopForm = document.getElementById('laptopForm');
const laptopsTable = document.getElementById('laptops-table').querySelector('tbody');
const laptopsMsg = document.getElementById('laptops-message');
document.getElementById('addLaptopBtn').onclick = () => {
    laptopForm.reset();
    document.getElementById('laptop-id').value = '';
    document.getElementById('laptopDeleteBtn').style.display = 'none';
    laptopModal.show();
};
laptopForm.onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById('laptop-id').value;
    const data = {
        id: id || 0,
        date: document.getElementById('laptop-date').value,
        name: document.getElementById('laptop-name').value,
        model: document.getElementById('laptop-model').value,
        color: document.getElementById('laptop-color').value,
        cpu: document.getElementById('laptop-cpu').value,
        price: parseFloat(document.getElementById('laptop-price').value)
    };
    const url = id ? '/api/menu2/UpdateLaptop' : '/api/menu2/AddLaptop';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) {
        laptopModal.hide();
        loadLaptops();
        laptopsMsg.textContent = id ? 'Kayıt güncellendi.' : 'Kayıt eklendi.';
        laptopsMsg.className = 'form-message success';
    } else {
        laptopsMsg.textContent = 'Hata oluştu.';
        laptopsMsg.className = 'form-message';
    }
};
async function loadLaptops() {
    laptopsTable.innerHTML = '<tr><td colspan="8">Yükleniyor...</td></tr>';
    const res = await fetch('/api/menu2/GetLaptops');
    const data = await res.json();
    laptopsTable.innerHTML = data.map(l => `
        <tr>
            <td>${l.id}</td>
            <td>${l.date ? l.date.replace('T',' ').slice(0,16) : ''}</td>
            <td>${l.name}</td>
            <td>${l.model}</td>
            <td>${l.color}</td>
            <td>${l.cpu}</td>
            <td>${l.price} TL</td>
            <td>
                <button type="button" class="btn btn-success me-2" onclick="editLaptop(${l.id})">Düzenle</button>
                <button type="button" class="btn btn-danger" onclick="deleteLaptop(${l.id})">Sil</button>
            </td>
        </tr>`).join('') || '<tr><td colspan="8">Kayıt yok.</td></tr>';
}
window.editLaptop = async function(id) {
    const res = await fetch('/api/menu2/GetLaptop?id=' + id);
    if (!res.ok) return;
    const l = await res.json();
    document.getElementById('laptop-id').value = l.id;
    document.getElementById('laptop-date').value = l.date ? l.date.slice(0,16) : '';
    document.getElementById('laptop-name').value = l.name;
    document.getElementById('laptop-model').value = l.model;
    document.getElementById('laptop-color').value = l.color;
    document.getElementById('laptop-cpu').value = l.cpu;
    document.getElementById('laptop-price').value = l.price;
    document.getElementById('laptopDeleteBtn').style.display = '';
    document.getElementById('laptopDeleteBtn').onclick = async function() {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        const res = await fetch('/api/menu2/DeleteLaptop?id=' + id, { method: 'DELETE' });
        if (res.ok) {
            laptopModal.hide();
            loadLaptops();
        }
    };
    laptopModal.show();
};
window.deleteLaptop = async function(id) {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    const res = await fetch('/api/menu2/DeleteLaptop?id=' + id, { method: 'DELETE' });
    if (res.ok) loadLaptops();
};
document.addEventListener('DOMContentLoaded', loadLaptops);

// --- Tabletler ---
const tabletModal = new bootstrap.Modal(document.getElementById('tabletModal'));
const tabletForm = document.getElementById('tabletForm');
const tabletsTable = document.getElementById('tablets-table').querySelector('tbody');
const tabletsMsg = document.getElementById('tablets-message');
document.getElementById('addTabletBtn').onclick = () => {
    tabletForm.reset();
    document.getElementById('tablet-id').value = '';
    document.getElementById('tabletDeleteBtn').style.display = 'none';
    tabletModal.show();
};
tabletForm.onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById('tablet-id').value;
    const data = {
        id: id || 0,
        date: document.getElementById('tablet-date').value,
        name: document.getElementById('tablet-name').value,
        model: document.getElementById('tablet-model').value,
        color: document.getElementById('tablet-color').value,
        screen: document.getElementById('tablet-screen').value,
        price: parseFloat(document.getElementById('tablet-price').value)
    };
    const url = id ? '/api/menu2/UpdateTablet' : '/api/menu2/AddTablet';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) {
        tabletModal.hide();
        loadTablets();
        tabletsMsg.textContent = id ? 'Kayıt güncellendi.' : 'Kayıt eklendi.';
        tabletsMsg.className = 'form-message success';
    } else {
        tabletsMsg.textContent = 'Hata oluştu.';
        tabletsMsg.className = 'form-message';
    }
};
async function loadTablets() {
    tabletsTable.innerHTML = '<tr><td colspan="8">Yükleniyor...</td></tr>';
    const res = await fetch('/api/menu2/GetTablets');
    const data = await res.json();
    tabletsTable.innerHTML = data.map(t => `
        <tr>
            <td>${t.id}</td>
            <td>${t.date ? t.date.replace('T',' ').slice(0,16) : ''}</td>
            <td>${t.name}</td>
            <td>${t.model}</td>
            <td>${t.color}</td>
            <td>${t.screen}</td>
            <td>${t.price} TL</td>
            <td>
                <button type="button" class="btn btn-success me-2" onclick="editTablet(${t.id})">Düzenle</button>
                <button type="button" class="btn btn-danger" onclick="deleteTablet(${t.id})">Sil</button>
            </td>
        </tr>`).join('') || '<tr><td colspan="8">Kayıt yok.</td></tr>';
}
window.editTablet = async function(id) {
    const res = await fetch('/api/menu2/GetTablet?id=' + id);
    if (!res.ok) return;
    const t = await res.json();
    document.getElementById('tablet-id').value = t.id;
    document.getElementById('tablet-date').value = t.date ? t.date.slice(0,16) : '';
    document.getElementById('tablet-name').value = t.name;
    document.getElementById('tablet-model').value = t.model;
    document.getElementById('tablet-color').value = t.color;
    document.getElementById('tablet-screen').value = t.screen;
    document.getElementById('tablet-price').value = t.price;
    document.getElementById('tabletDeleteBtn').style.display = '';
    document.getElementById('tabletDeleteBtn').onclick = async function() {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        const res = await fetch('/api/menu2/DeleteTablet?id=' + id, { method: 'DELETE' });
        if (res.ok) {
            tabletModal.hide();
            loadTablets();
        }
    };
    tabletModal.show();
};
window.deleteTablet = async function(id) {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    const res = await fetch('/api/menu2/DeleteTablet?id=' + id, { method: 'DELETE' });
    if (res.ok) loadTablets();
};
document.addEventListener('DOMContentLoaded', loadTablets);

// --- Araçlar ---
const carModal = new bootstrap.Modal(document.getElementById('carModal'));
const carForm = document.getElementById('carForm');
const carsTable = document.getElementById('cars-table').querySelector('tbody');
const carsMsg = document.getElementById('cars-message');
document.getElementById('addCarBtn').onclick = () => {
    carForm.reset();
    document.getElementById('car-id').value = '';
    document.getElementById('carDeleteBtn').style.display = 'none';
    carModal.show();
};
carForm.onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById('car-id').value;
    const data = {
        id: id || 0,
        date: document.getElementById('car-date').value,
        name: document.getElementById('car-name').value,
        model: document.getElementById('car-model').value,
        color: document.getElementById('car-color').value,
        year: parseInt(document.getElementById('car-year').value),
        price: parseFloat(document.getElementById('car-price').value)
    };
    const url = id ? '/api/menu2/UpdateCar' : '/api/menu2/AddCar';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) {
        carModal.hide();
        loadCars();
        carsMsg.textContent = id ? 'Kayıt güncellendi.' : 'Kayıt eklendi.';
        carsMsg.className = 'form-message success';
    } else {
        carsMsg.textContent = 'Hata oluştu.';
        carsMsg.className = 'form-message';
    }
};
async function loadCars() {
    carsTable.innerHTML = '<tr><td colspan="8">Yükleniyor...</td></tr>';
    const res = await fetch('/api/menu2/GetCars');
    const data = await res.json();
    carsTable.innerHTML = data.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${c.date ? c.date.replace('T',' ').slice(0,16) : ''}</td>
            <td>${c.name}</td>
            <td>${c.model}</td>
            <td>${c.color}</td>
            <td>${c.year}</td>
            <td>${c.price} TL</td>
            <td>
                <button type="button" class="btn btn-success me-2" onclick="editCar(${c.id})">Düzenle</button>
                <button type="button" class="btn btn-danger" onclick="deleteCar(${c.id})">Sil</button>
            </td>
        </tr>`).join('') || '<tr><td colspan="8">Kayıt yok.</td></tr>';
}
window.editCar = async function(id) {
    const res = await fetch('/api/menu2/GetCar?id=' + id);
    if (!res.ok) return;
    const c = await res.json();
    document.getElementById('car-id').value = c.id;
    document.getElementById('car-date').value = c.date ? c.date.slice(0,16) : '';
    document.getElementById('car-name').value = c.name;
    document.getElementById('car-model').value = c.model;
    document.getElementById('car-color').value = c.color;
    document.getElementById('car-year').value = c.year;
    document.getElementById('car-price').value = c.price;
    document.getElementById('carDeleteBtn').style.display = '';
    document.getElementById('carDeleteBtn').onclick = async function() {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        const res = await fetch('/api/menu2/DeleteCar?id=' + id, { method: 'DELETE' });
        if (res.ok) {
            carModal.hide();
            loadCars();
        }
    };
    carModal.show();
};
window.deleteCar = async function(id) {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    const res = await fetch('/api/menu2/DeleteCar?id=' + id, { method: 'DELETE' });
    if (res.ok) loadCars();
};
document.addEventListener('DOMContentLoaded', loadCars);

// --- Telefonlar ---
const phoneModal = new bootstrap.Modal(document.getElementById('phoneModal'));
const phoneForm = document.getElementById('phoneForm');
const phonesTable = document.getElementById('phones-table').querySelector('tbody');
const phonesMsg = document.getElementById('phones-message');
document.getElementById('addPhoneBtn').onclick = () => {
    phoneForm.reset();
    document.getElementById('phone-id').value = '';
    document.getElementById('phoneDeleteBtn').style.display = 'none';
    phoneModal.show();
};
phoneForm.onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById('phone-id').value;
    const data = {
        id: id || 0,
        date: document.getElementById('phone-date').value,
        name: document.getElementById('phone-name').value,
        model: document.getElementById('phone-model').value,
        color: document.getElementById('phone-color').value,
        storage: document.getElementById('phone-storage').value,
        price: parseFloat(document.getElementById('phone-price').value)
    };
    const url = id ? '/api/menu2/UpdatePhone' : '/api/menu2/AddPhone';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) {
        phoneModal.hide();
        loadPhones();
        phonesMsg.textContent = id ? 'Kayıt güncellendi.' : 'Kayıt eklendi.';
        phonesMsg.className = 'form-message success';
    } else {
        phonesMsg.textContent = 'Hata oluştu.';
        phonesMsg.className = 'form-message';
    }
};
async function loadPhones() {
    phonesTable.innerHTML = '<tr><td colspan="8">Yükleniyor...</td></tr>';
    const res = await fetch('/api/menu2/GetPhones');
    const data = await res.json();
    phonesTable.innerHTML = data.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.date ? p.date.replace('T',' ').slice(0,16) : ''}</td>
            <td>${p.name}</td>
            <td>${p.model}</td>
            <td>${p.color}</td>
            <td>${p.storage}</td>
            <td>${p.price} TL</td>
            <td>
                <button type="button" class="btn btn-success me-2" onclick="editPhone(${p.id})">Düzenle</button>
                <button type="button" class="btn btn-danger" onclick="deletePhone(${p.id})">Sil</button>
            </td>
        </tr>`).join('') || '<tr><td colspan="8">Kayıt yok.</td></tr>';
}
window.editPhone = async function(id) {
    const res = await fetch('/api/menu2/GetPhone?id=' + id);
    if (!res.ok) return;
    const p = await res.json();
    document.getElementById('phone-id').value = p.id;
    document.getElementById('phone-date').value = p.date ? p.date.slice(0,16) : '';
    document.getElementById('phone-name').value = p.name;
    document.getElementById('phone-model').value = p.model;
    document.getElementById('phone-color').value = p.color;
    document.getElementById('phone-storage').value = p.storage;
    document.getElementById('phone-price').value = p.price;
    document.getElementById('phoneDeleteBtn').style.display = '';
    document.getElementById('phoneDeleteBtn').onclick = async function() {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        const res = await fetch('/api/menu2/DeletePhone?id=' + id, { method: 'DELETE' });
        if (res.ok) {
            phoneModal.hide();
            loadPhones();
        }
    };
    phoneModal.show();
};
window.deletePhone = async function(id) {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    const res = await fetch('/api/menu2/DeletePhone?id=' + id, { method: 'DELETE' });
    if (res.ok) loadPhones();
};
document.addEventListener('DOMContentLoaded', loadPhones);

// --- Alışveriş ---
const shoppingModal = new bootstrap.Modal(document.getElementById('shoppingModal'));
const shoppingForm = document.getElementById('shoppingForm');
const shoppingsTable = document.getElementById('shoppings-table').querySelector('tbody');
const shoppingsMsg = document.getElementById('shoppings-message');
document.getElementById('addShoppingBtn').onclick = () => {
    shoppingForm.reset();
    document.getElementById('shopping-id').value = '';
    document.getElementById('shoppingDeleteBtn').style.display = 'none';
    shoppingModal.show();
};
shoppingForm.onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById('shopping-id').value;
    const data = {
        id: id || 0,
        date: document.getElementById('shopping-date').value,
        name: document.getElementById('shopping-name').value,
        category: document.getElementById('shopping-category').value,
        status: document.getElementById('shopping-status').value,
        price: parseFloat(document.getElementById('shopping-price').value)
    };
    const url = id ? '/api/menu2/UpdateShopping' : '/api/menu2/AddShopping';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) {
        shoppingModal.hide();
        loadShoppings();
        shoppingsMsg.textContent = id ? 'Kayıt güncellendi.' : 'Kayıt eklendi.';
        shoppingsMsg.className = 'form-message success';
    } else {
        shoppingsMsg.textContent = 'Hata oluştu.';
        shoppingsMsg.className = 'form-message';
    }
};
async function loadShoppings() {
    shoppingsTable.innerHTML = '<tr><td colspan="8">Yükleniyor...</td></tr>';
    const res = await fetch('/api/menu2/GetShoppings');
    const data = await res.json();
    shoppingsTable.innerHTML = data.map(s => `
        <tr>
            <td>${s.id}</td>
            <td>${s.date ? s.date.replace('T',' ').slice(0,16) : ''}</td>
            <td>${s.name}</td>
            <td>${s.category}</td>
            <td>${s.status}</td>
            <td>${s.price} TL</td>
            <td>
                <button type="button" class="btn btn-success me-2" onclick="editShopping(${s.id})">Düzenle</button>
                <button type="button" class="btn btn-danger" onclick="deleteShopping(${s.id})">Sil</button>
            </td>
        </tr>`).join('') || '<tr><td colspan="8">Kayıt yok.</td></tr>';
}
window.editShopping = async function(id) {
    const res = await fetch('/api/menu2/GetShopping?id=' + id);
    if (!res.ok) return;
    const s = await res.json();
    document.getElementById('shopping-id').value = s.id;
    document.getElementById('shopping-date').value = s.date ? s.date.slice(0,16) : '';
    document.getElementById('shopping-name').value = s.name;
    document.getElementById('shopping-category').value = s.category;
    document.getElementById('shopping-status').value = s.status;
    document.getElementById('shopping-price').value = s.price;
    document.getElementById('shoppingDeleteBtn').style.display = '';
    document.getElementById('shoppingDeleteBtn').onclick = async function() {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        const res = await fetch('/api/menu2/DeleteShopping?id=' + id, { method: 'DELETE' });
        if (res.ok) {
            shoppingModal.hide();
            loadShoppings();
        }
    };
    shoppingModal.show();
};
window.deleteShopping = async function(id) {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    const res = await fetch('/api/menu2/DeleteShopping?id=' + id, { method: 'DELETE' });
    if (res.ok) loadShoppings();
};
document.addEventListener('DOMContentLoaded', loadShoppings); 