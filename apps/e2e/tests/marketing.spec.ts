import { expect, test } from '@playwright/test';

test.describe('Insight.info marketing site', () => {
  test('navigation, product controls, pricing and FAQ work', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Insight\.info/);
    await expect(page.getByRole('heading', { name: 'See what people do. Know what to build.' })).toBeVisible();

    if (testInfo.project.name === 'mobile-chromium') {
      await page.getByRole('button', { name: 'Toggle menu' }).click();
      await expect(
        page.getByLabel('Primary navigation').getByRole('link', { name: 'Pricing', exact: true }),
      ).toBeVisible();
    }

    await page.getByRole('tab', { name: 'Funnels' }).click();
    await expect(page.getByText('Activation funnel')).toBeVisible();

    await page.getByRole('tab', { name: 'React' }).click();
    await expect(page.locator('[data-code="React"]')).toContainText('VemetricProvider');

    const range = page.getByRole('slider', { name: 'Monthly event tier' });
    await range.fill('2');
    await expect(page.locator('[data-event-label]')).toHaveText('250,000');
    await expect(page.locator('[data-price]')).toHaveText('25');

    const faq = page.getByText('Is Insight.info open source?');
    await faq.click();
    await expect(faq.locator('..').getByText(/AGPL-licensed Vemetric project/)).toBeVisible();

    await expect(page.locator('.hero').getByRole('link', { name: 'Start for free' })).toHaveAttribute(
      'href',
      '/signup',
    );
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
