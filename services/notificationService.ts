import { Note } from '../types';

class NotificationManager {
  private timeouts: Map<string, number> = new Map();

  public async requestPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.error("Could not request notification permission", e);
      }
    }
  }

  public syncNotifications(notes: Note[]) {
    this.clearAll();

    const now = Date.now();
    const MAX_TIMEOUT = 2147483647; 

    notes.forEach(note => {
      // Don't notify if done
      if (note.isDone || !note.hasSchedule || !note.scheduleDate) return;

      const scheduleTime = new Date(note.scheduleDate).getTime();
      const delay = scheduleTime - now;

      if (delay > 0 && delay < MAX_TIMEOUT) {
        const timeoutId = window.setTimeout(() => {
          this.triggerNotification(note);
        }, delay);
        
        this.timeouts.set(note.id, timeoutId);
      }
    });
  }

  private triggerNotification(note: Note) {
    if (Notification.permission === 'granted') {
      const n = new Notification("TIMELINE ALERT", {
        body: `${note.content}\n\nDO IT NOW.`,
        tag: note.id,
        requireInteraction: true,
        icon: '/favicon.ico'
      });
      n.onclick = () => { window.focus(); n.close(); };
    }
  }

  private clearAll() {
    this.timeouts.forEach((id) => window.clearTimeout(id));
    this.timeouts.clear();
  }
}

export const notificationService = new NotificationManager();