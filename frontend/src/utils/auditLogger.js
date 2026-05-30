export const addAuditLog = (action, level = 'info', user = 'System') => {
  const newLog = {
    id: Date.now() + Math.random(),
    user: user,
    action: action,
    time: 'Just now',
    level: level,
    timestamp: Date.now()
  };
  try {
    const stored = localStorage.getItem('admin_audit_logs');
    const logs = stored ? JSON.parse(stored) : [
      { id: 1, user: 'Admin One',   action: 'Updated fine rate to ₹12/day',        time: '2m ago',  level: 'warning', timestamp: Date.now() - 120000 },
      { id: 2, user: 'Sarah Mehta', action: 'Deleted book ISBN 9780132350884',      time: '15m ago', level: 'error',   timestamp: Date.now() - 900000 },
      { id: 3, user: 'System',      action: 'Backup completed successfully',        time: '1h ago',  level: 'success', timestamp: Date.now() - 3600000 },
      { id: 4, user: 'Admin One',   action: 'Added new librarian L003',             time: '3h ago',  level: 'info',    timestamp: Date.now() - 10800000 },
      { id: 5, user: 'System',      action: 'Scheduled fine auto-calculation ran',  time: '6h ago',  level: 'success', timestamp: Date.now() - 21600000 },
      { id: 6, user: 'Sarah Mehta', action: 'Issued 5 books via bulk scan',         time: '8h ago',  level: 'info',    timestamp: Date.now() - 28800000 },
      { id: 7, user: 'Admin One',   action: 'Blocked member M003 (Rahul Singh)',    time: '1d ago',  level: 'warning', timestamp: Date.now() - 86400000 }
    ];
    const updated = [newLog, ...logs];
    localStorage.setItem('admin_audit_logs', JSON.stringify(updated));
    // Dispatch custom event to notify listeners on the same tab
    window.dispatchEvent(new Event('storage_updated'));
  } catch (e) {
    console.error("Failed to add audit log to localStorage", e);
  }
};
