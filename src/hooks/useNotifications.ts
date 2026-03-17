'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  requestNotificationPermission,
  scheduleReminder,
  cancelReminder,
} from '@/lib/notifications/reminders'

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const enable = useCallback(async (reminderTime: string) => {
    const granted = await requestNotificationPermission()
    if (granted) {
      setPermission('granted')
      scheduleReminder(reminderTime)
    } else {
      setPermission('denied')
    }
    return granted
  }, [])

  const disable = useCallback(() => {
    cancelReminder()
  }, [])

  return { permission, enable, disable }
}
