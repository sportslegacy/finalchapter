import { chromium, devices } from "playwright";

async function testViewport(name, contextOptions) {
  const browser = await chromium.launch();
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  const label = page.locator(".nav-legends-label");
  const toggle = page.locator(".nav-legends-toggle");
  await label.waitFor({ state: "visible" });

  await label.click({ force: true });
  await page.waitForTimeout(400);
  const afterLabel = await page.evaluate(() => ({
    legendsOpen: document.querySelector(".site-nav")?.classList.contains("legends-open"),
    hash: location.hash,
    scrollY: window.scrollY,
    legendsTop: document.getElementById("legends")?.getBoundingClientRect().top,
  }));

  await toggle.click({ force: true });
  await page.waitForTimeout(200);
  const afterToggle = await page.evaluate(() => {
    const panel = document.getElementById("nav-legends-panel");
    const rect = panel?.getBoundingClientRect();
    return {
      legendsOpen: document.querySelector(".site-nav")?.classList.contains("legends-open"),
      panelExists: !!panel,
      panelHeight: rect?.height ?? 0,
      playerCount: document.querySelectorAll(".nav-legends-panel-player").length,
    };
  });

  const screenshot = await page.screenshot({ path: `/tmp/nav-test-${name.replace(/\s/g, "-")}.png` });
  console.log(`\n=== ${name} ===`);
  console.log("Label click:", afterLabel);
  console.log("Toggle click:", afterToggle, `screenshot bytes: ${screenshot.length}`);

  const playerTap = await page.locator(".nav-legends-panel-player").first();
  const playerVisible = await playerTap.isVisible();
  console.log("First player visible:", playerVisible);

  await browser.close();
  return (
    afterLabel.hash === "#legends" &&
    afterLabel.legendsTop !== undefined &&
    afterLabel.legendsTop < 120 &&
    afterToggle.legendsOpen &&
    afterToggle.panelExists &&
    afterToggle.panelHeight > 50 &&
    afterToggle.playerCount === 5 &&
    playerVisible
  );
}

const mobileOk = await testViewport("iPhone", {
  ...devices["iPhone 14 Pro Max"],
  hasTouch: true,
});
const desktopOk = await testViewport("Desktop", { viewport: { width: 1280, height: 800 } });

console.log("\nResult:", { mobileOk, desktopOk });
process.exit(mobileOk && desktopOk ? 0 : 1);
