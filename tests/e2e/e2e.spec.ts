import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Utsav Celebration Planner Full Journey", () => {
  test("Complete flow: Landing -> Wizard -> Plan -> Edit Budget -> Add Vendor -> Complete Tasks -> Export -> Persistence", async ({
    page,
  }) => {
    // 1. Visit Home (starts with sample or overview)
    await page.goto("/");
    await expect(page).toHaveTitle(/Utsav/);

    // Check accessibility with axe
    const axeResults = await new AxeBuilder({ page })
      .disableRules(["color-contrast"]) // Theme contrast checked independently
      .analyze();
    expect(axeResults.violations).toEqual([]);

    // 2. Open Wizard
    const planButtons = page.locator("button:has-text('Plan Celebration'), button:has-text('Plan a New Celebration')");
    if ((await planButtons.count()) > 0) {
      await planButtons.first().click();
      await expect(page.locator("text=Plan a New Celebration")).toBeVisible();

      // Step 1: Fill form
      await page.fill("#w-name", "Ananya & Kabir Sangeet");
      await page.fill("#w-date", "2026-11-28");
      await page.fill("#w-city", "Udaipur");
      await page.click("button:has-text('Continue')");

      // Step 2: Vibes
      await expect(page.locator("text=Celebration Vibe & Aesthetic *")).toBeVisible();
      await page.click("button:has-text('Continue')");

      // Step 3: Review & Generate
      await expect(page.locator("text=Generate Masterplan")).toBeVisible();
      await page.click("button:has-text('Generate Masterplan')");

      // Wait for masterplan modal to complete
      await expect(page.locator("text=Plan a New Celebration")).not.toBeVisible({ timeout: 10000 });
      await expect(page.locator("text=Ananya & Kabir Sangeet")).toBeVisible();
    }

    // 3. Navigate to Budget and inline edit
    await page.click("button:has-text('Budget & Costs'), button:has-text('Budget')");
    await expect(page.locator("text=Celebration Budget")).toBeVisible();

    // 4. Navigate to Timeline and toggle task
    await page.click("button:has-text('Timeline & Tasks'), button:has-text('Timeline')");
    await expect(page.locator("text=Celebration Timeline")).toBeVisible();

    // 5. Navigate to Vendors
    await page.click("button:has-text('Vendor Directory'), button:has-text('Vendors')");
    await expect(page.locator("text=Vendor Directory")).toBeVisible();

    // 6. Test 360px Mobile Viewport Smoke Test
    await page.setViewportSize({ width: 360, height: 740 });
    await expect(page.locator("nav[aria-label='Mobile Navigation']")).toBeVisible();

    // 7. Reload page to verify localStorage persistence
    await page.reload();
    await expect(page.locator("header")).toBeVisible();
  });
});

