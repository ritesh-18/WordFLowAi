'use client'

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function scheduleReminder(timeString: string, label = 'WordFlow AI'): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const [hours, minutes] = timeString.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hours, minutes, 0, 0)

  if (target <= now) {
    target.setDate(target.getDate() + 1) // schedule for tomorrow
  }

  const delayMs = target.getTime() - now.getTime()

  const timerId = window.setTimeout(() => {
    new Notification(label, {
      body: "Time for your daily practice! Keep your streak alive. 🔥",
      icon: '/icon.png',
      badge: '/badge.png',
    })
    // reschedule for next day
    scheduleReminder(timeString, label)
  }, delayMs)

  // Store so we can cancel if needed
  if (typeof window !== 'undefined') {
    ;(window as Window & { _wordflowReminderTimer?: number })._wordflowReminderTimer = timerId
  }
}

export function cancelReminder(): void {
  const w = window as Window & { _wordflowReminderTimer?: number }
  if (w._wordflowReminderTimer != null) {
    clearTimeout(w._wordflowReminderTimer)
    w._wordflowReminderTimer = undefined
  }
}
