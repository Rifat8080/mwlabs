import { createConsumer } from "@rails/actioncable"

const consumer = createConsumer()

consumer.subscriptions.create({ channel: "Admin::NotificationsChannel" }, {
  received(data) {
    try {
      if (data.type === "subscribed") {
        this.updateBadgeCount(data.unread_count)
        return
      }

      if (data.type === "notification_created") {
        this.prependNotification(data.dropdown_html)
        this.prependToIndexList(data.index_html)

        if (data.unread_count !== undefined) {
          this.updateBadgeCount(data.unread_count)
        }

        this.showToast("New Notification", "You have a new notification")
      }

      if (data.type === "unread_count_changed" && data.unread_count !== undefined) {
        this.updateBadgeCount(data.unread_count)
      }
    } catch (e) {
      console.error("Error handling notification:", e)
    }
  },

  prependNotification(html) {
    if (!html) return

    const list = document.getElementById('notifications-list')
    if (list) {
      document.getElementById("empty-notification-state")?.remove()

      const wrapper = document.createElement('div')
      wrapper.innerHTML = html
      const element = wrapper.firstElementChild
      if (!element) return

      element.style.opacity = '0'
      element.style.transform = 'translateX(-20px)'
      list.prepend(element)
      this.trimList(list, 15)

      setTimeout(() => {
        element.style.transition = 'all 0.3s ease'
        element.style.opacity = '1'
        element.style.transform = 'translateX(0)'
      }, 10)
    }
  },

  prependToIndexList(html) {
    if (!html) return

    const indexList = document.getElementById('admin-notifications-list')
    if (indexList) {
      document.getElementById("empty-admin-notification-state")?.remove()

      const wrapper = document.createElement('div')
      wrapper.innerHTML = html
      const element = wrapper.firstElementChild
      if (!element) return

      const list = indexList.querySelector("[data-notifications-list-items]") || indexList
      element.style.opacity = '0'
      element.style.transform = 'translateY(-20px)'
      list.prepend(element)

      setTimeout(() => {
        element.style.transition = 'all 0.3s ease'
        element.style.opacity = '1'
        element.style.transform = 'translateY(0)'
      }, 10)
    }
  },

  updateBadgeCount(count) {
    const badge = document.getElementById('notifications-badge')
    if (badge) {
      badge.textContent = count.toString()
      if (count > 0) {
        badge.classList.remove('hidden')
        badge.classList.add('animate-pulse')
        setTimeout(() => badge.classList.remove('animate-pulse'), 600)
      } else {
        badge.classList.add('hidden')
      }
    }

    const unreadPill = document.getElementById("notifications-unread-pill")
    if (unreadPill) {
      unreadPill.textContent = `${count} new`
    }
  },

  showToast(title, message) {
    const event = new CustomEvent('notification:received', {
      detail: { title, message }
    })
    document.dispatchEvent(event)
  },

  trimList(list, maxItems) {
    while (list.children.length > maxItems) {
      list.lastElementChild?.remove()
    }
  }
})
