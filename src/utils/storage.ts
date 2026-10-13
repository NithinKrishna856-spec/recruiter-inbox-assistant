import { TrackerItem } from '../types';

const STORAGE_KEY = 'recruiter_inbox_tracker_v2';

// Today's date string YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Add N days to date string
export function addDaysToDateString(baseDate: string, days: number): string {
  const d = new Date(baseDate + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Check if a follow-up date is overdue compared to today
export function isFollowUpOverdue(dateStr: string, status: string): boolean {
  if (!dateStr) return false;
  // Terminal statuses are not considered overdue
  if (status === 'Offer' || status === 'Rejected' || status === 'Not interested') {
    return false;
  }
  const today = getTodayDateString();
  return dateStr < today;
}

// Days difference between date and today
export function getDaysDiffFromToday(dateStr: string): number {
  if (!dateStr) return 0;
  const target = new Date(dateStr + 'T00:00:00').getTime();
  const today = new Date(getTodayDateString() + 'T00:00:00').getTime();
  const diffTime = target - today;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Format friendly date
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return 'No date set';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Format readable local date & time: YYYY-MM-DD h:mm A (e.g., 2026-10-03 5:34 PM)
export function formatLocalDateTime(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  } catch {
    return isoString;
  }
}

// Format date strictly as YYYY-MM-DD
export function formatISODateOnly(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const trimmed = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
}

export function loadTrackerItems(): TrackerItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const items = JSON.parse(raw);
    if (Array.isArray(items)) {
      return items.filter((item: TrackerItem) => !item.id?.startsWith('seed-'));
    }
    return [];
  } catch (err) {
    console.error('Failed to load tracker items from localStorage:', err);
    return [];
  }
}

export function saveTrackerItems(items: TrackerItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save tracker items to localStorage:', err);
  }
}

export function exportTrackerToCSV(items: TrackerItem[]): void {
  const headers = ['Company', 'Role', 'Type', 'Pay', 'Status', 'Follow-up Date', 'Notes', 'Created At'];
  const rows = items.map((item) => {
    const formattedFollowUp = formatISODateOnly(item.followUpDate);
    const formattedCreatedAt = formatLocalDateTime(item.createdAt);

    return [
      `"${(item.company || '').replace(/"/g, '""')}"`,
      `"${(item.role || '').replace(/"/g, '""')}"`,
      `"${(item.type || '').replace(/"/g, '""')}"`,
      `"${(item.pay || item.extractedDetails?.pay || 'Not mentioned').replace(/"/g, '""')}"`,
      `"${(item.status || '').replace(/"/g, '""')}"`,
      `"${formattedFollowUp.replace(/"/g, '""')}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
      `"${formattedCreatedAt.replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `recruiter-tracker-${getTodayDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
