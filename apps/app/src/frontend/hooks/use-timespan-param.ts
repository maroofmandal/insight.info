import { getRouteApi } from '@tanstack/react-router';
import type { TimeSpan } from '@vemetric/common/charts/timespans';
import { useEffect } from 'react';
import { getStoredTimespanData, setStoredTimespanData } from '@/utils/session-storage';

export type TimespanRoute =
  | '/$domain'
  | '/_layout/p/$projectId/'
  | '/_layout/p/$projectId/funnels/'
  | '/_layout/p/$projectId/funnels/$funnelId'
  | '/_layout/p/$projectId/users/'
  | '/_layout/p/$projectId/events/';

interface Props {
  from: TimespanRoute;
}

export const useTimespanParam = ({ from }: Props) => {
  const route = getRouteApi(from);

  const navigate = route.useNavigate();
  const { t, sd, ed } = route.useSearch() as {
    t?: TimeSpan;
    sd?: string;
    ed?: string;
  };
  const hasAnyParam = Boolean(t || sd || ed);
  const isPublicDashboard = from === '/$domain';

  const storedTimeSpanData = getStoredTimespanData();
  const timespan = t ?? (isPublicDashboard ? '24hrs' : storedTimeSpanData.timespan) ?? '24hrs';
  const startDate = sd ?? (hasAnyParam || isPublicDashboard ? undefined : storedTimeSpanData.startDate);
  const endDate = ed ?? (hasAnyParam || isPublicDashboard ? undefined : storedTimeSpanData.endDate);

  useEffect(() => {
    const keepImplicitPublicDefault = isPublicDashboard && !hasAnyParam;
    if (!keepImplicitPublicDefault && (t !== timespan || sd !== startDate || ed !== endDate)) {
      navigate({
        search: (prev) => ({ ...prev, t: timespan, sd: startDate, ed: endDate }),
        params: (prev) => prev,
        replace: true,
      });
    }

    if (!keepImplicitPublicDefault) {
      setStoredTimespanData(timespan, startDate, endDate);
    }
  }, [timespan, t, startDate, sd, endDate, ed, navigate, isPublicDashboard, hasAnyParam]);

  return { timespan, startDate, endDate };
};
