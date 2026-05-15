export type NotificationType = "ORDER" | "INVENTORY" | "PRICE" | "SYSTEM";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  unread: boolean;
}

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "ntf-001",
    title: "Don hang moi #DH-2048",
    message: "Co don hang moi can xac nhan thanh toan.",
    type: "ORDER",
    createdAt: "2026-05-12T13:28:00.000Z",
    unread: true,
  },
  {
    id: "ntf-002",
    title: "Canh bao ton kho",
    message: "Nhan kim cuong solitaire con 2 san pham.",
    type: "INVENTORY",
    createdAt: "2026-05-12T09:45:00.000Z",
    unread: true,
  },
  {
    id: "ntf-003",
    title: "Cap nhat gia vang",
    message: "Gia vang SJC vua duoc cap nhat luc 08:00.",
    type: "PRICE",
    createdAt: "2026-05-12T01:00:00.000Z",
    unread: false,
  },
  {
    id: "ntf-004",
    title: "Lich bao tri he thong",
    message: "He thong se bao tri luc 22:00 toi nay.",
    type: "SYSTEM",
    createdAt: "2026-05-11T10:10:00.000Z",
    unread: false,
  },
  {
    id: "ntf-005",
    title: "Don hang #DH-2041 da hoan tat",
    message: "Don hang da ban giao thanh cong cho khach.",
    type: "ORDER",
    createdAt: "2026-05-11T07:24:00.000Z",
    unread: false,
  },
];

export function getUnreadNotificationCount(
  notifications = MOCK_NOTIFICATIONS,
): number {
  return notifications.filter((notification) => notification.unread).length;
}

export function getNotificationTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    ORDER: "Don hang",
    INVENTORY: "Ton kho",
    PRICE: "Gia vang",
    SYSTEM: "He thong",
  };

  return labels[type];
}

export function formatRelativeTime(isoDate: string): string {
  const timestamp = new Date(isoDate).getTime();
  const now = Date.now();
  const diffMinutes = Math.max(1, Math.floor((now - timestamp) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} phut truoc`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} gio truoc`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngay truoc`;
}
