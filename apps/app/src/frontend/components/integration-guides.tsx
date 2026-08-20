import { SimpleGrid } from '@chakra-ui/react';
import {
  TbBrandAstro,
  TbBrandGoogleFilled,
  TbBrandNextjs,
  TbBrandNpm,
  TbBrandReact,
  TbBrandWordpress,
  TbCode,
  TbRegistered,
} from 'react-icons/tb';
import { DocsCard } from './docs-card';

export const IntegrationGuides = () => {
  return (
    <SimpleGrid columns={[1, 2]} gap={2.5}>
      <DocsCard
        icon={TbCode}
        title="HTML Script Tag"
        description="The simplest way to integrate Insight.info into any website."
        href="https://insight.info/docs/sdks/html-script"
      />
      <DocsCard
        icon={TbBrandNpm}
        title="JavaScript SDK"
        description="For web applications, with proper TypeScript support."
        href="https://insight.info/docs/sdks/javascript"
      />
      <DocsCard
        icon={TbBrandGoogleFilled}
        title="Google Tag Manager"
        description="Integrate Insight.info using Google Tag Manager."
        href="https://insight.info/docs/install/google-tag-manager"
      />
      <DocsCard
        icon={TbBrandWordpress}
        title="WordPress"
        description="Integrate Insight.info into your WordPress website."
        href="https://insight.info/docs/install/wordpress"
      />
      <DocsCard
        icon={TbBrandAstro}
        title="Astro SDK"
        description="Integrate Insight.info into your Astro application"
        href="https://insight.info/docs/sdks/astro"
      />
      <DocsCard
        icon={TbBrandNextjs}
        title="Next.js"
        description="Integrate Insight.info into your Next.js application"
        href="https://insight.info/docs/install/nextjs"
      />
      <DocsCard
        icon={TbRegistered}
        title="React Router (Remix)"
        description="Integrate Insight.info into your React Router application"
        href="https://insight.info/docs/install/react-router"
      />
      <DocsCard
        icon={TbBrandReact}
        title="React SDK"
        description="Integrate Insight.info into your React application"
        href="https://insight.info/docs/sdks/react"
      />
    </SimpleGrid>
  );
};
