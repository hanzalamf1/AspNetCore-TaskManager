// API URL otomatik algılama
const API_URL = 'https://localhost:7187/api';

// Global utility functions
const API = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const config = {
            ...options,
            headers: { ...defaultHeaders, ...options.headers }
        };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);
            
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
                window.location.href = 'login.html';
                return null;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Bir sunucu hatası oluştu.');
            }

            const contentType = response.headers.get("content-type");
            if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
                return null; // Return null if no content or not JSON
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Auth endpoints
    auth: {
        login: (credentials) => API.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),
        register: (userData) => API.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        }),
        getProfile: () => API.request('/auth/me'),
        changePassword: (passwords) => API.request('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify(passwords)
        }),
        updateProfile: (profileData) => API.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        })
    },

    // Task endpoints
    tasks: {
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters);
            return API.request(`/tasks?${params}`);
        },
        getStatistics: () => API.request('/tasks/statistics'),
        create: (taskData) => API.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        }),
        update: (id, taskData) => API.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        }),
        complete: (id) => API.request(`/tasks/${id}/complete`, {
            method: 'PUT'
        }),
        delete: (id) => API.request(`/tasks/${id}`, {
            method: 'DELETE'
        }),
        bulkComplete: (taskIds) => API.request('/tasks/bulk-complete', {
            method: 'POST',
            body: JSON.stringify(taskIds)
        }),
        bulkDelete: (taskIds) => API.request('/tasks/bulk-delete', {
            method: 'DELETE',
            body: JSON.stringify(taskIds)
        })
    },

    // Notification endpoints
    notifications: {
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters);
            return API.request(`/notifications?${params}`);
        },
        getUnreadCount: () => API.request('/notifications/unread-count'),
        markAsRead: (id) => API.request(`/notifications/${id}/read`, {
            method: 'PUT'
        }),
        markAllAsRead: () => API.request('/notifications/mark-all-read', {
            method: 'PUT'
        }),
        delete: (id) => API.request(`/notifications/${id}`, {
            method: 'DELETE'
        }),
        clearAll: () => API.request('/notifications/clear-all', {
            method: 'DELETE'
        })
    }
};

// SPA geçişleri
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const tasksSection = document.getElementById('tasks-section');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');

function showSection(section) {
    loginSection.style.display = 'none';
    registerSection.style.display = 'none';
    tasksSection.style.display = 'none';
    section.style.display = 'block';
}

if (showRegister) showRegister.onclick = () => showSection(registerSection);
if (showLogin) showLogin.onclick = () => showSection(loginSection);
if (logoutBtn) logoutBtn.onclick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    showSection(loginSection);
};

// Kayıt (SPA ve standalone için ortak)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email') ? document.getElementById('register-email').value.trim() : '';
        const phone = document.getElementById('register-phone') ? document.getElementById('register-phone').value.trim() : '';
        const password = document.getElementById('register-password').value;
        const msg = document.getElementById('register-message');
        msg.textContent = '';
        
        // Client-side validation
        if (username.length < 3) {
            msg.textContent = 'Kullanıcı adı en az 3 karakter olmalı.'; 
            msg.style.color = '#ef4444'; 
            return;
        }
        if (document.getElementById('register-email') && !/^.+@.+\..+$/.test(email)) {
            msg.textContent = 'Geçerli bir e-posta adresi giriniz.'; 
            msg.style.color = '#ef4444'; 
            return;
        }
        if (document.getElementById('register-phone') && !/^\+?\d{10,15}$/.test(phone)) {
            msg.textContent = 'Geçerli bir telefon numarası giriniz.'; 
            msg.style.color = '#ef4444'; 
            return;
        }
        if (password.length < 6) {
            msg.textContent = 'Şifre en az 6 karakter olmalı.'; 
            msg.style.color = '#ef4444'; 
            return;
        }
        
        try {
            const data = await API.auth.register({ username, email, phoneNumber: phone, password });
            if (data.success) {
                msg.style.color = '#22c55e';
                msg.textContent = data.message || 'Kayıt başarılı! Giriş yapabilirsiniz.';
                setTimeout(() => {
                    if (window.location.pathname.endsWith('register.html')) {
                        window.location = 'login.html?registered=1';
                    } else {
                        showSection(loginSection);
                        document.getElementById('login-message').textContent = 'Kayıt başarılı! Giriş yapabilirsiniz.';
                        document.getElementById('login-message').style.color = '#22c55e';
                    }
                }, 1500);
            } else {
                msg.style.color = '#ef4444';
                msg.textContent = data.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
            }
        } catch (err) {
            msg.style.color = '#ef4444';
            msg.textContent = err.message || 'Sunucuya ulaşılamıyor. İnternet bağlantınızı ve API adresini kontrol edin.';
        }
    };
}

// Giriş (SPA ve standalone için ortak)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username') ? document.getElementById('login-username').value.trim() : document.getElementById('username').value.trim();
        const password = document.getElementById('login-password') ? document.getElementById('login-password').value : document.getElementById('password').value;
        const msg = document.getElementById('login-message');
        msg.textContent = '';
        msg.style.display = 'none';
        msg.className = 'form-message';
        if (!username || !password) {
            msg.textContent = 'Kullanıcı adı ve şifre zorunludur.';
            msg.style.color = '#ef4444';
            msg.style.display = 'block';
            msg.className = 'form-message alert alert-danger';
            return;
        }
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            let data = {};
            let errorMessage = 'Kullanıcı adı veya şifre hatalı.';
            try {
                data = await response.json();
            } catch (jsonErr) {
                data = { message: errorMessage };
            }
            if (response.ok && data.token) {
                localStorage.setItem('token', data.token);
                if (data.user) {
                    localStorage.setItem('userData', JSON.stringify(data.user));
                }
                window.location.href = 'home.html';
            } else {
                msg.style.color = '#ef4444';
                if (data.message && data.message.toLowerCase().includes('erişim süreniz dolmuştur')) {
                    msg.textContent = data.message;
                } else {
                    msg.textContent = errorMessage;
                }
                msg.style.display = 'block';
                msg.className = 'form-message alert alert-danger';
            }
        } catch (err) {
            msg.style.color = '#ef4444';
            msg.textContent = 'Kullanıcı adı veya şifre hatalı.';
            msg.style.display = 'block';
            msg.className = 'form-message alert alert-danger';
        }
    };
}

// Görevler
const taskForm = document.getElementById('taskForm');
const tasksList = document.getElementById('tasks-list');
const tasksMsg = document.getElementById('tasks-message');

async function loadTasks(filters = {}) {
    if (!tasksList) return;
    tasksList.innerHTML = '';
    tasksMsg.textContent = '';
    
    try {
        const tasks = await API.tasks.getAll(filters);
        if (tasks.length === 0) {
            tasksList.innerHTML = '<li>Henüz görev yok.</li>';
            return;
        }
        
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = task.isCompleted ? 'completed' : '';
            li.innerHTML = `
                <span>${task.title} <small>${task.description || ''}</small></span>
                <div class="task-actions">
                    <button class="edit">Düzenle</button>
                    <button class="delete">Sil</button>
                    <button class="complete">${task.isCompleted ? 'Geri Al' : 'Tamamla'}</button>
                </div>
            `;
            
            // Sil
            li.querySelector('.delete').onclick = async () => {
                if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
                    try {
                        await API.tasks.delete(task.id);
                        loadTasks();
                    } catch (err) {
                        tasksMsg.textContent = err.message;
                    }
                }
            };
            
            // Tamamla/Geri Al
            li.querySelector('.complete').onclick = async () => {
                try {
                    if (task.isCompleted) {
                        await API.tasks.update(task.id, { ...task, isCompleted: false });
                    } else {
                        await API.tasks.complete(task.id);
                    }
                    loadTasks();
                } catch (err) {
                    tasksMsg.textContent = err.message;
                }
            };
            
            // Düzenle
            li.querySelector('.edit').onclick = async () => {
                const newTitle = prompt('Yeni başlık:', task.title);
                if (newTitle && newTitle.trim().length > 0) {
                    try {
                        await API.tasks.update(task.id, { ...task, title: newTitle });
                        loadTasks();
                    } catch (err) {
                        tasksMsg.textContent = err.message;
                    }
                }
            };
            
            tasksList.appendChild(li);
        });
    } catch (err) {
        tasksMsg.textContent = err.message || 'Görevler yüklenemedi.';
    }
}

if (taskForm) {
    taskForm.onsubmit = async (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-desc').value.trim();
        
        if (title.length < 1) {
            tasksMsg.textContent = 'Başlık boş olamaz.';
            return;
        }
        
        try {
            await API.tasks.create({ title, description });
            document.getElementById('task-title').value = '';
            document.getElementById('task-desc').value = '';
            loadTasks();
        } catch (err) {
            tasksMsg.textContent = err.message;
        }
    };
}

// Dropdown elements
const userDropdownBtn = document.getElementById('userDropdownBtn');
const userDropdownMenu = document.getElementById('userDropdownMenu');
const userDropdownEmail = document.getElementById('userDropdownEmail');
const userDropdownDays = document.getElementById('userDropdownDays');
const userDropdownName = document.getElementById('userDropdownName');
const userSettingsLink = document.getElementById('userSettingsLink');
const menu1 = document.getElementById('menu1');
const menu2 = document.getElementById('menu2');

// Show/hide dropdown
if (userDropdownBtn && userDropdownMenu) {
    userDropdownBtn.onclick = (e) => {
        e.stopPropagation();
        userDropdownMenu.style.display = userDropdownMenu.style.display === 'block' ? 'none' : 'block';
    };
    document.addEventListener('click', (e) => {
        if (!userDropdownMenu.contains(e.target) && e.target !== userDropdownBtn) {
            userDropdownMenu.style.display = 'none';
        }
    });
}

// Fetch user info and update dropdown
async function loadUserProfile() {
    if (!localStorage.getItem('token')) return;
    
    try {
        const userData = await API.auth.getProfile();
        if (userData) {
            if (userDropdownEmail) userDropdownEmail.textContent = userData.email;
            if (userDropdownDays) userDropdownDays.textContent = userData.remainingDays;
            if (userDropdownName) userDropdownName.textContent = userData.username;
            
            // Update localStorage with fresh data
            localStorage.setItem('userData', JSON.stringify(userData));
        }
    } catch (err) {
        console.error('Failed to load user profile:', err);
    }
}

// Load user profile on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadUserProfile);
} else {
    loadUserProfile();
}

// Settings page functionality
const changePasswordForm = document.getElementById('changePasswordForm');
if (changePasswordForm) {
    changePasswordForm.onsubmit = async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const msg = document.getElementById('passwordMessage');
        
        if (newPassword !== confirmPassword) {
            msg.textContent = 'Yeni şifreler eşleşmiyor.';
            msg.style.color = '#ef4444';
            return;
        }
        
        if (newPassword.length < 6) {
            msg.textContent = 'Yeni şifre en az 6 karakter olmalı.';
            msg.style.color = '#ef4444';
            return;
        }
        
        try {
            const data = await API.auth.changePassword({ currentPassword, newPassword });
            msg.style.color = '#22c55e';
            msg.textContent = data.message || 'Şifre başarıyla değiştirildi.';
            changePasswordForm.reset();
        } catch (err) {
            msg.style.color = '#ef4444';
            msg.textContent = err.message || 'Şifre değiştirilemedi.';
        }
    };
}

// Profile page functionality
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    // Load current profile data
    async function loadProfileData() {
        try {
            const userData = await API.auth.getProfile();
            if (userData) {
                document.getElementById('profileUsername').value = userData.username;
                document.getElementById('profileEmail').value = userData.email;
                document.getElementById('profilePhone').value = userData.phoneNumber;
            }
        } catch (err) {
            console.error('Failed to load profile data:', err);
        }
    }
    
    loadProfileData();
    
    profileForm.onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('profileUsername').value.trim();
        const email = document.getElementById('profileEmail').value.trim();
        const phone = document.getElementById('profilePhone').value.trim();
        const msg = document.getElementById('profileMessage');
        
        try {
            const data = await API.auth.updateProfile({ username, email, phoneNumber: phone });
            msg.style.color = '#22c55e';
            msg.textContent = data.message || 'Profil başarıyla güncellendi.';
            
            // Update localStorage
            if (data.user) {
                localStorage.setItem('userData', JSON.stringify(data.user));
            }
        } catch (err) {
            msg.style.color = '#ef4444';
            msg.textContent = err.message || 'Profil güncellenemedi.';
        }
    };
}

// Notification system
async function loadNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;
    
    try {
        const data = await API.notifications.getAll();
        notificationsList.innerHTML = '';
        
        if (data.notifications.length === 0) {
            notificationsList.innerHTML = '<div class="empty-state">Bildirim bulunamadı.</div>';
            return;
        }
        
        data.notifications.forEach(notification => {
            const div = document.createElement('div');
            div.className = `notification-item ${notification.isRead ? 'read' : 'unread'} ${notification.type}`;
            div.innerHTML = `
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <small>${new Date(notification.createdAt).toLocaleString('tr-TR')}</small>
                </div>
                <div class="notification-actions">
                    ${!notification.isRead ? '<button class="mark-read" data-id="' + notification.id + '">Okundu</button>' : ''}
                    <button class="delete-notification" data-id="' + notification.id + '">Sil</button>
                </div>
            `;
            
            notificationsList.appendChild(div);
        });
        
        // Add event listeners
        notificationsList.querySelectorAll('.mark-read').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                try {
                    await API.notifications.markAsRead(id);
                    loadNotifications();
                } catch (err) {
                    console.error('Failed to mark notification as read:', err);
                }
            };
        });
        
        notificationsList.querySelectorAll('.delete-notification').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                if (confirm('Bu bildirimi silmek istediğinize emin misiniz?')) {
                    try {
                        await API.notifications.delete(id);
                        loadNotifications();
                    } catch (err) {
                        console.error('Failed to delete notification:', err);
                    }
                }
            };
        });
    } catch (err) {
        console.error('Failed to load notifications:', err);
    }
}

// Load notifications if on notifications page
if (document.getElementById('notificationsList')) {
    loadNotifications();
}

// Mark all notifications as read
const markAllReadBtn = document.getElementById('markAllReadBtn');
if (markAllReadBtn) {
    markAllReadBtn.onclick = async () => {
        try {
            await API.notifications.markAllAsRead();
            loadNotifications();
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        }
    };
}

// Clear all notifications
const clearAllNotificationsBtn = document.getElementById('clearAllNotificationsBtn');
if (clearAllNotificationsBtn) {
    clearAllNotificationsBtn.onclick = async () => {
        if (confirm('Tüm bildirimleri silmek istediğinize emin misiniz?')) {
            try {
                await API.notifications.clearAll();
                loadNotifications();
            } catch (err) {
                console.error('Failed to clear all notifications:', err);
            }
        }
    };
}

// Utility function for showing sections
function showOnlySection(section) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.style.display = 'none');
    section.style.display = 'block';
}

// Export functions for use in other pages
window.TaskManagerAPI = API;
window.loadTasks = loadTasks;
window.loadUserProfile = loadUserProfile;
window.loadNotifications = loadNotifications; 