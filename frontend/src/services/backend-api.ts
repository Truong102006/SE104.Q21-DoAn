"use client";

import { apiRequest } from "@/services/api-client";
import type {
  CustomerRequest,
  CustomerResponse,
  InventoryReportResponse,
  PageResponse,
  ProductRequest,
  ProductResponse,
  ProductRevenueReportResponse,
  ProductTypeRequest,
  ProductTypeResponse,
  PurchaseRequest,
  PurchaseResponse,
  SaleRequest,
  SaleResponse,
  SearchProductResponse,
  SearchServiceTicketResponse,
  ServicePrepaymentRateRequest,
  ServicePrepaymentRateResponse,
  ServiceRevenueReportResponse,
  ServiceTicketRequest,
  ServiceTicketResponse,
  ServiceTypeRequest,
  ServiceTypeResponse,
  SupplierRequest,
  SupplierResponse,
  UploadImageResponse,
  UnitRequest,
  UnitResponse,
  UserGroupResponse,
  UserRequest,
  UserResponse,
} from "@/types/backend";

export const backendApi = {
  suppliers: {
    list: (q?: string) =>
      apiRequest<SupplierResponse[]>("/api/suppliers", { query: { q } }),
    getById: (id: string) => apiRequest<SupplierResponse>(`/api/suppliers/${id}`),
    create: (payload: SupplierRequest) =>
      apiRequest<SupplierResponse>("/api/suppliers", { method: "POST", body: payload }),
    update: (id: string, payload: SupplierRequest) =>
      apiRequest<SupplierResponse>(`/api/suppliers/${id}`, { method: "PUT", body: payload }),
    remove: (id: string) =>
      apiRequest<null>(`/api/suppliers/${id}`, { method: "DELETE" }),
  },

  customers: {
    list: (q?: string, page?: number, size?: number) =>
      apiRequest<CustomerResponse[]>("/api/customers", { query: { q, page, size } }),
    getById: (id: string) => apiRequest<CustomerResponse>(`/api/customers/${id}`),
    create: (payload: CustomerRequest) =>
      apiRequest<CustomerResponse>("/api/customers", { method: "POST", body: payload }),
    update: (id: string, payload: CustomerRequest) =>
      apiRequest<CustomerResponse>(`/api/customers/${id}`, { method: "PUT", body: payload }),
    remove: (id: string) =>
      apiRequest<null>(`/api/customers/${id}`, { method: "DELETE" }),
  },

  units: {
    list: (q?: string) => apiRequest<UnitResponse[]>("/api/units", { query: { q } }),
    getById: (id: string) => apiRequest<UnitResponse>(`/api/units/${id}`),
    create: (payload: UnitRequest) =>
      apiRequest<UnitResponse>("/api/units", { method: "POST", body: payload }),
    update: (id: string, payload: UnitRequest) =>
      apiRequest<UnitResponse>(`/api/units/${id}`, { method: "PUT", body: payload }),
    remove: (id: string) => apiRequest<null>(`/api/units/${id}`, { method: "DELETE" }),
  },

  productTypes: {
    list: (q?: string) =>
      apiRequest<ProductTypeResponse[]>("/api/product-types", { query: { q } }),
    getById: (id: string) => apiRequest<ProductTypeResponse>(`/api/product-types/${id}`),
    create: (payload: ProductTypeRequest) =>
      apiRequest<ProductTypeResponse>("/api/product-types", { method: "POST", body: payload }),
    update: (id: string, payload: ProductTypeRequest) =>
      apiRequest<ProductTypeResponse>(`/api/product-types/${id}`, { method: "PUT", body: payload }),
    remove: (id: string) =>
      apiRequest<null>(`/api/product-types/${id}`, { method: "DELETE" }),
  },

  serviceTypes: {
    list: (q?: string) =>
      apiRequest<ServiceTypeResponse[]>("/api/service-types", { query: { q } }),
    getById: (id: string) => apiRequest<ServiceTypeResponse>(`/api/service-types/${id}`),
    create: (payload: ServiceTypeRequest) =>
      apiRequest<ServiceTypeResponse>("/api/service-types", { method: "POST", body: payload }),
    update: (id: string, payload: ServiceTypeRequest) =>
      apiRequest<ServiceTypeResponse>(`/api/service-types/${id}`, { method: "PUT", body: payload }),
    remove: (id: string) =>
      apiRequest<null>(`/api/service-types/${id}`, { method: "DELETE" }),
  },

  products: {
    list: (params: { keyword?: string; productTypeId?: string; page?: number; size?: number }) =>
      apiRequest<PageResponse<ProductResponse>>("/api/products", {
        query: {
          keyword: params.keyword,
          productTypeId: params.productTypeId,
          page: params.page ?? 0,
          size: params.size ?? 20,
        },
      }),
    search: (keyword: string) =>
      apiRequest<ProductResponse[]>("/api/products/search", { query: { keyword } }),
    catalog: (params: {
      keyword?: string;
      productTypeId?: string;
      stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
      sort?: "newest" | "priceAsc" | "priceDesc" | "stockAsc" | "stockDesc";
      page?: number;
      size?: number;
    }) =>
      apiRequest<PageResponse<ProductResponse>>("/api/products/catalog", {
        query: {
          keyword: params.keyword,
          productTypeId: params.productTypeId,
          stockStatus: params.stockStatus,
          sort: params.sort,
          page: params.page ?? 0,
          size: params.size ?? 20,
        },
      }),
    getById: (id: string) => apiRequest<ProductResponse>(`/api/products/${id}`),
    create: (payload: ProductRequest) =>
      apiRequest<ProductResponse>("/api/products", { method: "POST", body: payload }),
    update: (id: string, payload: ProductRequest) =>
      apiRequest<ProductResponse>(`/api/products/${id}`, { method: "PUT", body: payload }),
    remove: (id: string) => apiRequest<null>(`/api/products/${id}`, { method: "DELETE" }),
  },

  uploads: {
    uploadImage: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiRequest<UploadImageResponse>("/api/uploads/images", {
        method: "POST",
        body: formData,
      });
    },
  },

  purchases: {
    list: (params?: { keyword?: string; page?: number; size?: number }) =>
      apiRequest<PurchaseResponse[] | PageResponse<PurchaseResponse>>("/api/purchases", {
        query: {
          keyword: params?.keyword,
          page: params?.page,
          size: params?.size,
        },
      }),
    getById: (soPhieuMua: string) =>
      apiRequest<PurchaseResponse>(`/api/purchases/${soPhieuMua}`),
    printData: (soPhieuMua: string) =>
      apiRequest<PurchaseResponse>(`/api/purchases/${soPhieuMua}/print-data`),
    create: (payload: PurchaseRequest) =>
      apiRequest<PurchaseResponse>("/api/purchases", { method: "POST", body: payload }),
  },

  sales: {
    list: (params?: { keyword?: string; page?: number; size?: number }) =>
      apiRequest<SaleResponse[] | PageResponse<SaleResponse>>("/api/sales", {
        query: {
          keyword: params?.keyword,
          page: params?.page,
          size: params?.size,
        },
      }),
    getById: (soPhieuBan: string) => apiRequest<SaleResponse>(`/api/sales/${soPhieuBan}`),
    create: (payload: SaleRequest) =>
      apiRequest<SaleResponse>("/api/sales", { method: "POST", body: payload }),
  },

  serviceTickets: {
    list: (params?: { keyword?: string; page?: number; size?: number }) =>
      apiRequest<ServiceTicketResponse[] | PageResponse<ServiceTicketResponse>>("/api/service-tickets", {
        query: {
          keyword: params?.keyword,
          page: params?.page,
          size: params?.size,
        },
      }),
    getById: (soPhieuDichVu: string) =>
      apiRequest<ServiceTicketResponse>(`/api/service-tickets/${soPhieuDichVu}`),
    create: (payload: ServiceTicketRequest) =>
      apiRequest<ServiceTicketResponse>("/api/service-tickets", { method: "POST", body: payload }),
    deliverItem: (soPhieuDichVu: string, maLoaiDichVu: string, ngayGiao?: string) =>
      apiRequest<ServiceTicketResponse>(`/api/service-tickets/${soPhieuDichVu}/items/${maLoaiDichVu}/deliver`, {
        method: "PATCH",
        body: ngayGiao ? { ngayGiao } : {},
      }),
    deliverAll: (soPhieuDichVu: string, ngayGiao?: string) =>
      apiRequest<ServiceTicketResponse>(`/api/service-tickets/${soPhieuDichVu}/deliver-all`, {
        method: "PATCH",
        body: ngayGiao ? { ngayGiao } : {},
      }),
  },

  search: {
    products: (params: { keyword?: string; page?: number; size?: number }) =>
      apiRequest<PageResponse<SearchProductResponse>>("/api/search/products", {
        query: {
          keyword: params.keyword,
          page: params.page ?? 0,
          size: params.size ?? 20,
        },
      }),
    serviceTickets: (params: {
      keyword?: string;
      status?: string;
      fromDate?: string;
      toDate?: string;
      page?: number;
      size?: number;
    }) =>
      apiRequest<PageResponse<SearchServiceTicketResponse>>("/api/search/service-tickets", {
        query: {
          keyword: params.keyword,
          status: params.status,
          fromDate: params.fromDate,
          toDate: params.toDate,
          page: params.page ?? 0,
          size: params.size ?? 20,
        },
      }),
    drillDown: (params: { type: string; id: string; month: number; year: number }) =>
      apiRequest<unknown[]>("/api/search/drill-down", {
        query: {
          type: params.type,
          id: params.id,
          month: params.month,
          year: params.year,
        },
      }),
  },

  reports: {
    inventoryGenerate: (month: number, year: number) =>
      apiRequest<InventoryReportResponse>("/api/reports/inventory/generate", {
        method: "POST",
        query: { month, year },
      }),
    inventoryGet: (month: number, year: number) =>
      apiRequest<InventoryReportResponse>("/api/reports/inventory", { query: { month, year } }),
    inventoryById: (id: string) => apiRequest<InventoryReportResponse>(`/api/reports/inventory/${id}`),

    revenueProductsGenerate: (month: number, year: number) =>
      apiRequest<ProductRevenueReportResponse>("/api/reports/revenue/products/generate", {
        method: "POST",
        query: { month, year },
      }),
    revenueProductsGet: (month: number, year: number) =>
      apiRequest<ProductRevenueReportResponse>("/api/reports/revenue/products", {
        query: { month, year },
      }),

    revenueServicesGenerate: (month: number, year: number) =>
      apiRequest<ServiceRevenueReportResponse>("/api/reports/revenue/services/generate", {
        method: "POST",
        query: { month, year },
      }),
    revenueServicesGet: (month: number, year: number) =>
      apiRequest<ServiceRevenueReportResponse>("/api/reports/revenue/services", {
        query: { month, year },
      }),
  },

  settings: {
    productTypes: (q?: string) =>
      apiRequest<ProductTypeResponse[]>("/api/settings/product-types", { query: { q } }),
    units: (q?: string) => apiRequest<UnitResponse[]>("/api/settings/units", { query: { q } }),
    serviceTypes: (q?: string) =>
      apiRequest<ServiceTypeResponse[]>("/api/settings/service-types", { query: { q } }),
    getServicePrepaymentRate: () =>
      apiRequest<ServicePrepaymentRateResponse>("/api/settings/service-prepayment-rate"),
    updateServicePrepaymentRate: (payload: ServicePrepaymentRateRequest) =>
      apiRequest<ServicePrepaymentRateResponse>("/api/settings/service-prepayment-rate", {
        method: "PUT",
        body: payload,
      }),
  },

  users: {
    list: (q?: string) => apiRequest<UserResponse[]>("/api/v1/nguoi-dung", { query: { q } }),
    create: (payload: UserRequest) =>
      apiRequest<UserResponse>("/api/v1/nguoi-dung", { method: "POST", body: payload }),
    update: (tenDangNhap: string, payload: UserRequest) =>
      apiRequest<UserResponse>(`/api/v1/nguoi-dung/${tenDangNhap}`, { method: "PUT", body: payload }),
    remove: (tenDangNhap: string) =>
      apiRequest<null>(`/api/v1/nguoi-dung/${tenDangNhap}`, { method: "DELETE" }),
  },

  userGroups: {
    list: (q?: string) =>
      apiRequest<UserGroupResponse[]>("/api/v1/nhom-nguoi-dung", { query: { q } }),
  },
};
