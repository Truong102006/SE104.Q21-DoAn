const MENU_SECTIONS = [
  {
    key: "nav.mainScreen",
    label: "Màn hình chính",
    items: [
      { key: "nav.dashboard", label: "Dashboard", href: "/dashboard" },
      { key: "nav.accounts", label: "Quản lý tài khoản", href: "/dashboard/staff" },
      { key: "nav.settings", label: "Thay đổi quy định", href: "/dashboard/settings" },
    ],
  },
  {
    key: "nav.entryScreen",
    label: "Nhập liệu",
    items: [
      { key: "nav.purchaseOrders", label: "Lập phiếu mua", href: "/dashboard/purchase-orders" },
      { key: "nav.salesOrders", label: "Lập phiếu bán", href: "/dashboard/orders" },
      { key: "nav.serviceOrders", label: "Lập phiếu dịch vụ", href: "/dashboard/service-orders" },
      { key: "nav.products", label: "Sản phẩm", href: "/dashboard/products" },
      { key: "nav.productTypes", label: "Loại sản phẩm", href: "/dashboard/product-types" },
      { key: "nav.serviceTypes", label: "Loại dịch vụ", href: "/dashboard/service-types" },
      { key: "nav.customers", label: "Khách hàng", href: "/dashboard/customers" },
      { key: "nav.suppliers", label: "Nhà cung cấp", href: "/dashboard/suppliers" },
      { key: "nav.units", label: "Đơn vị tính", href: "/dashboard/units" },
    ],
  },
  {
    key: "nav.lookupScreen",
    label: "Tra cứu",
    items: [
      { key: "nav.productSearch", label: "Tra cứu sản phẩm", href: "/dashboard/products?mode=search" },
      { key: "nav.serviceSearch", label: "Tra cứu phiếu dịch vụ", href: "/dashboard/service-voucher-lookup" },
    ],
  },
  {
    key: "nav.notificationScreen",
    label: "Thông báo",
    items: [
      { key: "nav.notifications", label: "Danh sách thông báo", href: "/dashboard/notifications" },
    ],
  },
  {
    key: "nav.reportsScreen",
    label: "Báo biểu",
    items: [
      { key: "nav.reports", label: "Báo cáo", href: "/dashboard/reports" },
    ],
  },
];

function test(pathname, searchParamsObj) {
  const searchParams = {
    get: (key) => searchParamsObj[key] || null
  };

  const isItemActive = (item) => {
    // Phân tích href của item
    const hasQuery = item.href.includes("?");
    const pathPart = hasQuery ? item.href.split("?")[0] : item.href;
    const queryPart = hasQuery ? item.href.split("?")[1] : "";

    // 1. Kiểm tra khớp pathname cơ bản
    // Nếu pathPart là /dashboard (trang chủ dashboard), chỉ khớp chính xác /dashboard
    if (pathPart === "/dashboard") {
      return pathname === "/dashboard";
    }

    // Đối với các trang khác, pathname của trình duyệt phải khớp chính xác hoặc là sub-path của pathPart
    const isPathMatched = pathname === pathPart || pathname.startsWith(pathPart + "/");
    if (!isPathMatched) return false;

    // 2. Kiểm tra khớp query parameters (nếu item có query parameters)
    if (hasQuery) {
      const params = new URLSearchParams(queryPart);
      for (const [key, value] of params.entries()) {
        if (searchParams.get(key) !== value) {
          return false;
        }
      }
      return true;
    }

    // 3. Nếu item KHÔNG có query parameters, nhưng trình duyệt đang ở chế độ đặc biệt của trang đó
    if (pathPart === "/dashboard/products") {
      const mode = searchParams.get("mode");
      if (mode === "search") {
        return false;
      }
    }

    return true;
  };

  const isSectionActive = (section) => {
    return section.items.some((item) => isItemActive(item));
  };

  console.log(`\n--- Test với pathname: "${pathname}", params: ${JSON.stringify(searchParamsObj)} ---`);
  MENU_SECTIONS.forEach((section) => {
    const active = isSectionActive(section);
    console.log(`${section.label}: ${active ? "ACTIVE" : "inactive"}`);
    if (active) {
      section.items.forEach(item => {
        if (isItemActive(item)) {
          console.log(`  -> Item active: ${item.label} (${item.href})`);
        }
      });
    }
  });
}

test("/dashboard/products", {});
test("/dashboard/products", { mode: "search" });
test("/dashboard/products/new", {});
test("/dashboard/products/new", { mode: "search" });
test("/dashboard", {});
test("/dashboard/orders", {});
test("/dashboard/service-voucher-lookup", {});
