
class Notification {
    static show(html, duration = 5) {

        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.style.setProperty('--notification-duration', `${duration}s`);
        notification.innerHTML = html;

        const existingNotifications = document.querySelectorAll('.notification');
        const notificationHeight = 50; // Adjust as needed

        existingNotifications.forEach((existingNotification) => {
            const top = parseInt(existingNotification.getAttribute('data-top'), 10);
            existingNotification.setAttribute('data-top', top + notificationHeight);
            existingNotification.style.top = `${top + notificationHeight}px`;
        });

        notification.setAttribute('data-top', 20);
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();

            existingNotifications.forEach((existingNotification) => {
                const top = parseInt(existingNotification.getAttribute('data-top'), 10);
                existingNotification.setAttribute('data-top', top - notificationHeight);
                existingNotification.style.top = `${top - notificationHeight}px`;
            });
        }, duration * 990);

        return notification;
    }
}
