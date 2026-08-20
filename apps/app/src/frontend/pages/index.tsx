import { createFileRoute } from '@tanstack/react-router';
import { MarketingRedirect } from '@/components/marketing-redirect';

export const Route = createFileRoute('/')({ component: MarketingRedirect });
