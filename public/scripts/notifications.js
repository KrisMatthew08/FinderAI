// Notification System
(function() {
    let notificationInterval;
    const POLL_INTERVAL = 30000; // Poll every 30 seconds

    // Check if user is logged in
    function isLoggedIn() {
        return !!localStorage.getItem('token');
    }

    // Fetch notifications
    async function fetchNotifications() {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch notifications');

            const data = await response.json();
            updateNotificationUI(data.notifications, data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }

    // Update notification UI
    function updateNotificationUI(notifications, unreadCount) {
        const badge = document.getElementById('notificationBadge');
        const list = document.getElementById('notificationList');

        // Update badge
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }

        // Update list
        if (notifications.length === 0) {
            list.innerHTML = `
                <div class="empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications yet</p>
                </div>
            `;
            return;
        }

        list.innerHTML = notifications.map(notif => {
            const icon = getNotificationIcon(notif.type);
            const timeAgo = getTimeAgo(new Date(notif.createdAt));
            const unreadClass = notif.read ? '' : 'unread';

            return `
                <div class="notification-item ${unreadClass}" data-id="${notif._id}">
                    <button onclick="deleteNotification('${notif._id}')" title="Delete">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="notification-content" onclick="markAsRead('${notif._id}')">
                        <div class="notification-icon">${icon}</div>
                        <div class="notification-text">
                            <strong>${notif.title}</strong>
                            <p>${notif.message}</p>
                            <div class="notification-time">${timeAgo}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Get notification icon based on type
    function getNotificationIcon(type) {
        const icons = {
            'match': '<i class="fas fa-check-circle" style="color: #4CAF50;"></i>',
            'claim': '<i class="fas fa-hand-holding" style="color: #2196F3;"></i>',
            'system': '<i class="fas fa-info-circle" style="color: #FF9800;"></i>'
        };
        return icons[type] || icons.system;
    }

    // Get time ago string
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
            }
        }

        return 'Just now';
    }

    // Mark notification as read
    window.markAsRead = async function(notificationId) {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Refresh notifications
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Delete notification
    window.deleteNotification = async function(notificationId) {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Refresh notifications
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Toggle notification dropdown
    document.getElementById('notificationBell')?.addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('notificationDropdown');
        dropdown.classList.toggle('show');
        
        if (dropdown.classList.contains('show')) {
            fetchNotifications();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('notificationDropdown');
        const bell = document.getElementById('notificationBell');
        
        if (dropdown && !dropdown.contains(e.target) && e.target !== bell) {
            dropdown.classList.remove('show');
        }
    });

    // Mark all as read
    document.getElementById('markAllRead')?.addEventListener('click', async function() {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await fetch('/api/notifications/mark-all-read', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    });

    // Initialize notification system
    function initNotifications() {
        if (!isLoggedIn()) return;

        // Fetch immediately
        fetchNotifications();

        // Poll for new notifications
        notificationInterval = setInterval(fetchNotifications, POLL_INTERVAL);
    }

    // Start when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNotifications);
    } else {
        initNotifications();
    }
})();
