class NotificationManager {
  constructor() {
    this.checkAuth();
  }

  async checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.token = token;
    this.init();
  }

  init() {
    this.notificationBell = document.getElementById('notificationBell');
    this.notificationBadge = document.getElementById('notificationBadge');
    this.notificationDropdown = document.getElementById('notificationDropdown');
    this.notificationList = document.getElementById('notificationList');
    this.markAllReadBtn = document.getElementById('markAllRead');

    if (!this.notificationBell) return;

    this.setupEventListeners();
    this.loadNotifications();
    this.loadUnreadCount();

    // Refresh notifications every 30 seconds
    setInterval(() => {
      this.loadUnreadCount();
    }, 30000);
  }

  setupEventListeners() {
    // Toggle dropdown
    this.notificationBell.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Mark all as read
    if (this.markAllReadBtn) {
      this.markAllReadBtn.addEventListener('click', () => {
        this.markAllAsRead();
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.notificationDropdown.contains(e.target) && 
          !this.notificationBell.contains(e.target)) {
        this.closeDropdown();
      }
    });
  }

  toggleDropdown() {
    if (this.notificationDropdown.classList.contains('show')) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    this.notificationDropdown.classList.add('show');
    this.loadNotifications();
  }

  closeDropdown() {
    this.notificationDropdown.classList.remove('show');
  }

  async loadUnreadCount() {
    try {
      const response = await fetch('/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.updateBadge(data.count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }

  updateBadge(count) {
    if (count > 0) {
      this.notificationBadge.textContent = count > 99 ? '99+' : count;
      this.notificationBadge.style.display = 'flex';
    } else {
      this.notificationBadge.style.display = 'none';
    }
  }

  async loadNotifications() {
    try {
      this.notificationList.innerHTML = '<p class="loading" style="text-align:center; padding: 20px; color: #999;">Loading...</p>';

      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load notifications');

      const notifications = await response.json();
      this.displayNotifications(notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notificationList.innerHTML = '<p class="notification-empty">Failed to load notifications</p>';
    }
  }

  displayNotifications(notifications) {
    if (notifications.length === 0) {
      this.notificationList.innerHTML = `
        <div class="notification-empty">
          <i class="fas fa-bell-slash" style="font-size: 2rem; color: #ccc; margin-bottom: 10px;"></i>
          <p>No notifications yet</p>
        </div>
      `;
      return;
    }

    this.notificationList.innerHTML = notifications.map(notif => `
      <div class="notification-item ${notif.read ? '' : 'unread'}" data-id="${notif._id}">
        <div class="notification-title">
          ${this.getNotificationIcon(notif.type)} ${notif.title}
        </div>
        <div class="notification-message">${notif.message}</div>
        <div class="notification-time">${this.formatTime(notif.createdAt)}</div>
        <button class="notification-delete" onclick="notificationManager.deleteNotification('${notif._id}', event)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');

    // Add click handlers to mark as read
    document.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-delete')) {
          this.markAsRead(item.dataset.id);
        }
      });
    });
  }

  getNotificationIcon(type) {
    const icons = {
      'match_found': '<i class="fas fa-check-circle" style="color: #4caf50;"></i>',
      'item_claimed': '<i class="fas fa-hand-holding" style="color: #ff9800;"></i>',
      'item_returned': '<i class="fas fa-undo" style="color: #2196f3;"></i>',
      'system': '<i class="fas fa-info-circle" style="color: #9c27b0;"></i>'
    };
    return icons[type] || '<i class="fas fa-bell"></i>';
  }

  formatTime(date) {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now - notifDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return notifDate.toLocaleDateString();
  }

  async markAsRead(id) {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      // Update UI
      const item = document.querySelector(`.notification-item[data-id="${id}"]`);
      if (item) {
        item.classList.remove('unread');
      }

      this.loadUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead() {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      // Update UI
      document.querySelectorAll('.notification-item.unread').forEach(item => {
        item.classList.remove('unread');
      });

      this.loadUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  async deleteNotification(id, event) {
    event.stopPropagation();

    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      // Remove from UI
      const item = document.querySelector(`.notification-item[data-id="${id}"]`);
      if (item) {
        item.remove();
      }

      this.loadUnreadCount();

      // Reload if no notifications left
      if (document.querySelectorAll('.notification-item').length === 0) {
        this.loadNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }
}

// Initialize when DOM is ready
let notificationManager;
document.addEventListener('DOMContentLoaded', () => {
  notificationManager = new NotificationManager();
});
