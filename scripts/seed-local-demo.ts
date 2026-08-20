import { hashPassword } from 'better-auth/crypto';
import {
  clickhouseClient,
  clickhouseEvent,
  clickhouseSession,
  clickhouseUser,
  type ClickhouseEvent,
  type ClickhouseSession,
  type ClickhouseUser,
} from 'clickhouse';
import { prismaClient } from 'database';

const PROJECT_ID = '8100000000000001';
const ORGANIZATION_ID = 'insight-demo-org';
const PROJECT_TOKEN = 'insight-local-demo-token';

export const LOCAL_DEMO_CREDENTIALS = {
  demo: {
    email: process.env.INSIGHT_DEMO_EMAIL ?? 'demo@insight.info',
    password: process.env.INSIGHT_DEMO_PASSWORD ?? 'Demo@Insight2026',
    name: 'Insight Demo',
    role: 'MEMBER' as const,
  },
  admin: {
    email: process.env.INSIGHT_ADMIN_EMAIL ?? 'admin@insight.info',
    password: process.env.INSIGHT_ADMIN_PASSWORD ?? 'Admin@Insight2026',
    name: 'Insight Admin',
    role: 'ADMIN' as const,
  },
};

const toClickhouseDate = (date: Date) => date.toISOString().replace('T', ' ').replace('Z', '');

async function seedApplicationData() {
  await prismaClient.organization.upsert({
    where: { id: ORGANIZATION_ID },
    update: { name: 'Insight.info Demo', pricingOnboarded: true },
    create: { id: ORGANIZATION_ID, name: 'Insight.info Demo', pricingOnboarded: true },
  });

  await prismaClient.project.upsert({
    where: { id: PROJECT_ID },
    update: {
      name: 'Insight.info',
      domain: 'insight.info',
      token: PROJECT_TOKEN,
      publicDashboard: true,
      firstEventAt: new Date(),
    },
    create: {
      id: PROJECT_ID,
      organizationId: ORGANIZATION_ID,
      name: 'Insight.info',
      domain: 'insight.info',
      token: PROJECT_TOKEN,
      publicDashboard: true,
      firstEventAt: new Date(),
    },
  });

  for (const [key, credential] of Object.entries(LOCAL_DEMO_CREDENTIALS)) {
    const userId = `insight-local-${key}`;
    const accountId = `insight-local-${key}-credential`;
    const password = await hashPassword(credential.password);

    await prismaClient.user.upsert({
      where: { email: credential.email },
      update: { name: credential.name, emailVerified: true },
      create: {
        id: userId,
        email: credential.email,
        name: credential.name,
        emailVerified: true,
        receiveEmailTips: false,
      },
    });

    const user = await prismaClient.user.findUniqueOrThrow({ where: { email: credential.email } });

    await prismaClient.account.upsert({
      where: { id: accountId },
      update: { userId: user.id, password, updatedAt: new Date() },
      create: {
        id: accountId,
        accountId: user.id,
        providerId: 'credential',
        userId: user.id,
        password,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prismaClient.userOrganization.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: ORGANIZATION_ID } },
      update: { role: credential.role },
      create: { userId: user.id, organizationId: ORGANIZATION_ID, role: credential.role },
    });

    await prismaClient.userProjectAccess.upsert({
      where: { userId_projectId: { userId: user.id, projectId: PROJECT_ID } },
      update: { organizationId: ORGANIZATION_ID },
      create: { userId: user.id, projectId: PROJECT_ID, organizationId: ORGANIZATION_ID },
    });
  }
}

async function seedAnalyticsData() {
  const projectId = BigInt(PROJECT_ID);
  const now = Date.now();
  const countries = ['US', 'IN', 'DE', 'GB', 'CA', 'AU'];
  const cities = ['New York', 'Mumbai', 'Berlin', 'London', 'Toronto', 'Sydney'];
  const sources = [
    { name: 'Google', url: 'https://google.com', type: 'search' },
    { name: 'Direct', url: '', type: 'direct' },
    { name: 'GitHub', url: 'https://github.com', type: 'social' },
  ];
  const sessions: ClickhouseSession[] = [];
  const events: ClickhouseEvent[] = [];
  const users: ClickhouseUser[] = [];

  for (let index = 0; index < 18; index += 1) {
    const userId = BigInt(1001 + index);
    const sessionId = `insight-demo-session-${index + 1}`;
    const startedAt = new Date(now - (22 - index) * 60 * 60 * 1000);
    const endedAt = new Date(startedAt.getTime() + (3 + (index % 9)) * 60 * 1000);
    const countryCode = countries[index % countries.length];
    const city = cities[index % cities.length];
    const source = sources[index % sources.length];
    const userIdentifier = `visitor-${String(index + 1).padStart(2, '0')}@example.com`;
    const userDisplayName = `Visitor ${index + 1}`;
    const commonUrl = {
      origin: 'https://insight.info',
      urlHash: '',
      queryParams: {},
      utmSource: source.name === 'Google' ? 'google' : '',
      utmMedium: source.type,
      utmCampaign: index % 2 === 0 ? 'open-source-launch' : '',
      utmContent: index % 3 === 0 ? 'hero-demo' : '',
      utmTerm: '',
    };
    const commonVisitor = {
      countryCode,
      city,
      latitude: null,
      longitude: null,
      userAgent: 'Mozilla/5.0 (Insight.info local demo)',
      referrer: source.name,
      referrerUrl: source.url,
      referrerType: source.type,
      ...commonUrl,
    };

    sessions.push({
      projectId,
      userId,
      id: sessionId,
      userIdentifier,
      userDisplayName,
      startedAt: toClickhouseDate(startedAt),
      endedAt: toClickhouseDate(endedAt),
      duration: Math.round((endedAt.getTime() - startedAt.getTime()) / 1000),
      pathname: '/',
      importSource: 'insight-local-demo',
      ...commonVisitor,
    });

    users.push({
      projectId,
      id: userId,
      identifier: userIdentifier,
      displayName: userDisplayName,
      avatarUrl: '',
      createdAt: toClickhouseDate(startedAt),
      firstSeenAt: toClickhouseDate(startedAt),
      updatedAt: toClickhouseDate(endedAt),
      initialDeviceId: userId,
      pathname: '/',
      customData: { plan: index % 3 === 0 ? 'Pro' : 'Free', source: 'Local demo' },
      ...commonVisitor,
    });

    const baseEvent = {
      projectId,
      userId,
      sessionId,
      deviceId: userId,
      contextId: `${sessionId}-context`,
      userIdentifier,
      userDisplayName,
      requestHeaders: {},
      importSource: 'insight-local-demo',
      osName: index % 2 === 0 ? 'macOS' : 'Windows',
      osVersion: '14',
      clientName: index % 3 === 0 ? 'Safari' : 'Chrome',
      clientVersion: '126',
      clientType: 'browser',
      deviceType: index % 4 === 0 ? ('mobile' as const) : ('desktop' as const),
      ...commonVisitor,
    };

    events.push(
      {
        ...baseEvent,
        id: `insight-demo-${index + 1}-landing`,
        createdAt: toClickhouseDate(new Date(startedAt.getTime() + 20_000)),
        name: '$$pageView',
        isPageView: true,
        pathname: '/',
        customData: {},
      },
      {
        ...baseEvent,
        id: `insight-demo-${index + 1}-page`,
        createdAt: toClickhouseDate(new Date(startedAt.getTime() + 80_000)),
        name: '$$pageView',
        isPageView: true,
        pathname: index % 2 === 0 ? '/pricing' : '/docs/installation',
        customData: {},
      },
      {
        ...baseEvent,
        id: `insight-demo-${index + 1}-action`,
        createdAt: toClickhouseDate(new Date(startedAt.getTime() + 140_000)),
        name: index % 3 === 0 ? 'signup_started' : 'demo_viewed',
        isPageView: false,
        pathname: index % 3 === 0 ? '/signup' : '/insight.info',
        customData: { source: source.name },
      },
    );
  }

  for (const table of ['event', 'session', 'user']) {
    await clickhouseClient.command({
      query: `ALTER TABLE ${table} DELETE WHERE projectId = {projectId:UInt64} SETTINGS mutations_sync = 2`,
      query_params: { projectId: PROJECT_ID },
    });
  }

  await clickhouseSession.insert(sessions);
  await clickhouseUser.insert(users);
  await clickhouseEvent.insert(events);
}

try {
  await seedApplicationData();
  await seedAnalyticsData();
  console.log('Seeded Insight.info local demo, demo user, and admin user.');
} finally {
  await prismaClient.$disconnect();
  await clickhouseClient.close();
}
