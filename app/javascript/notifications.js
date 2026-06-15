// Request notification permission when user interacts with notifications
export function setupNotificationPermissions() {
  if ('Notification' in window && Notification.permission === 'default') {
    const button = document.querySelector('[data-action="click->notification#markAsRead"]')
    if (button) {
      button.addEventListener('click', () => {
        Notification.requestPermission()
      })
    }
  }
}

// Initialize on page load
document.addEventListener('turbo:load', setupNotificationPermissions)
