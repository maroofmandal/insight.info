import { useEffect } from 'react';
import { SplashScreen } from '@/components/splash-screen';
import { getLandingPageUrl } from '@/utils/url';

export const MarketingRedirect = () => {
  useEffect(() => {
    window.location.replace(getLandingPageUrl());
  }, []);
  return <SplashScreen />;
};
