import { expect, test } from "@playwright/test";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Tên đăng nhập").fill("admin");
  await page.locator("#password").fill("admin123");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("Core dashboard flows", () => {
  test("orders form validates realtime and can save when valid", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/dashboard/orders");

    const saveButton = page.getByRole("button", { name: "Lưu phiếu bán hàng" });
    await expect(saveButton).toBeEnabled();

    const firstRow = page.locator("table tbody tr").first();
    const quantityInput = firstRow.locator("input").first();
    await quantityInput.fill("0");
    await expect(saveButton).toBeDisabled();

    await quantityInput.fill("2");
    await expect(saveButton).toBeEnabled();

    await saveButton.click();
    await expect(
      page.getByText("Đã lưu phiếu bán hàng thành công", { exact: false }),
    ).toBeVisible();
  });

  test("manual date input works in modern picker", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/dashboard/orders");

    const dateInput = page.locator("#created-date");
    await dateInput.fill("15/05/2026");
    await dateInput.blur();
    await expect(dateInput).toHaveValue("15/05/2026");
  });

  test("service order blocks save when prepaid exceeds line amount", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/dashboard/service-orders");

    const saveButton = page.getByRole("button", { name: "Lưu phiếu dịch vụ" });
    await expect(saveButton).toBeEnabled();

    const firstRow = page.locator("table").first().locator("tbody tr").first();
    const prepaidInput = firstRow.locator("input").nth(2);
    await prepaidInput.fill("999999999");
    await expect(saveButton).toBeDisabled();

    await prepaidInput.fill("0");
    await expect(saveButton).toBeEnabled();
  });

  test("reports screen exposes CSV/PDF export actions", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/dashboard/reports");

    await expect(page.getByRole("button", { name: "Xuất CSV" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Xuất PDF" })).toBeVisible();
    await expect(page.getByRole("button", { name: "In báo cáo" })).toBeVisible();
  });
});
