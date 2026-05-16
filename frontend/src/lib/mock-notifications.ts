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
    title: "Đơn hàng mới #DH-2048",
    message: "Có đơn hàng mới cần xác nhận thanh toán.",
    type: "ORDER",
    createdAt: "2026-05-12T13:28:00.000Z",
    unread: true,
  },
  {
    id: "ntf-002",
    title: "Cảnh báo tồn kho",
    message: "Nhẫn kim cương solitaire còn 2 sản phẩm.",
    type: "INVENTORY",
    createdAt: "2026-05-12T09:45:00.000Z",
    unread: true,
  },
  {
    id: "ntf-003",
    title: "Cập nhật giá vàng",
    message: "Giá vàng SJC vừa được cập nhật lúc 08:00.",
    type: "PRICE",
    createdAt: "2026-05-12T01:00:00.000Z",
    unread: false,
  },
  {
    id: "ntf-004",
    title: "Lịch bảo trì hệ thống",
    message: "Hệ thống sẽ bảo trì lúc 22:00 tối nay.",
    type: "SYSTEM",
    createdAt: "2026-05-11T10:10:00.000Z",
    unread: false,
  },
  {
    id: "ntf-005",
    title: "Đơn hàng #DH-2041 đã hoàn tất",
    message: "Đơn hàng đã bàn giao thành công cho khách.",
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
    ORDER: "Đơn hàng",
    INVENTORY: "Tồn kho",
    PRICE: "Giá vàng",
    SYSTEM: "Hệ thống",
  };

  return labels[type];
}

export function formatRelativeTime(isoDate: string): string {
  const timestamp = new Date(isoDate).getTime();
  const now = Date.now();
  const diffMinutes = Math.max(1, Math.floor((now - timestamp) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
}


