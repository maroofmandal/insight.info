import { expect, test } from '@playwright/test';

test.describe('Insight.info marketing site', () => {
  test('navigation, product controls, pricing and FAQ work', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Insight\.info/);
    await expect(page.getByRole('heading', { name: /How do your users find you\?/ })).toBeVisible();

    if (testInfo.project.name === 'mobile-chromium') {
      await page.getByRole('button', { name: 'Toggle menu' }).click();
      await expect(
        page.getByLabel('Primary navigation').getByRole('link', { name: 'Pricing', exact: true }),
      ).toBeVisible();
    }

    const hero = page.locator('.hero');
    await expect(hero.getByRole('link', { name: /Start tracking/ })).toHaveAttribute('href', '/signup');
    await expect(hero.getByRole('link', { name: /View Live Demo/ })).toHaveAttribute(
      'href',
      '/insight.info?t=24hrs',
    );

    const heroEvents = hero.locator('[data-hero-event]');
    await heroEvents.nth(0).click();
    await expect(heroEvents.nth(0)).toHaveAttribute('aria-expanded', 'true');
    await heroEvents.nth(1).click();
    await expect(heroEvents.nth(0)).toHaveAttribute('aria-expanded', 'false');
    await expect(heroEvents.nth(1)).toHaveAttribute('aria-expanded', 'true');

    await page.getByRole('tab', { name: 'Funnels' }).click();
    const funnelPanel = page.locator('[data-product-panel="funnels"]');
    await expect(funnelPanel).toBeVisible();
    await expect(funnelPanel).toHaveAttribute('src', /hero-funnels\.webp\?v=insight-/);
    await expect.poll(() => funnelPanel.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(2424);
    await expect(page.locator('[data-product-panel="dashboard"]')).toBeHidden();
    expect(
      await page.locator('.product-screen').evaluate((screen) => getComputedStyle(screen, '::after').content),
    ).toBe('none');

    await page.getByRole('tab', { name: 'React' }).click();
    await expect(page.locator('[data-code="React"]')).toContainText('VemetricScript');

    const range = page.getByRole('slider', { name: 'Monthly event tier' });
    await range.fill('2');
    await expect(page.locator('[data-event-label]')).toHaveText('25,000,000');
    await expect(page.locator('[data-price]')).toHaveText('25');

    await page.getByRole('button', { name: /Yearly/ }).click();
    await expect(page.locator('[data-price]')).toHaveText('250');
    await expect(page.locator('[data-price-period]')).toHaveText('/year');

    const faq = page.getByText('Can I start for free?');
    await faq.click();
    await expect(faq.locator('..').getByText(/no credit card required/i)).toBeVisible();

    await expect(hero.locator('img[src*="/images/reference/dominik.png"]')).toBeVisible();
    await expect(page.locator('img[src*="vemetric.com"]')).toHaveCount(0);
  });

  test('documentation search and legal draft state are explicit', async ({ page }) => {
    await page.goto('/docs');
    const search = page.getByRole('searchbox', { name: 'Search documentation' });
    await search.fill('proxy');
    await expect(page.getByRole('link', { name: /Use a first-party proxy/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /WordPress/ })).toBeHidden();

    await page.goto('/legal/privacy-policy');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
    await expect(page.getByRole('status')).toContainText('Draft document');
  });

  test('does not overflow horizontally', async ({ page }) => {
    await page.goto('/');
    const sizes = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth + 1);
  });
});

test.describe('public dashboard', () => {
  test('loads a seeded public project with an explicit default timespan', async ({ page }) => {
    const domain = process.env.E2E_PUBLIC_DOMAIN;
    test.skip(!domain, 'Set E2E_PUBLIC_DOMAIN after seeding a public project.');
    await page.goto(`/${domain}?t=24hrs`);
    await expect(page).toHaveURL(new RegExp(`/${domain?.replace('.', '\\.')}\\?t=24hrs`));
    await expect(page.locator(`a[href="https://${domain}"]`)).toBeVisible();
  });
});
