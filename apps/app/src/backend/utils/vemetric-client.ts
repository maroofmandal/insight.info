import { getInsightToken, getVemetricUrl } from '@vemetric/common/env';
import { Vemetric } from '@vemetric/node';

const insightToken = getInsightToken();
if (!insightToken) {
  throw new Error('INSIGHT_TOKEN (or VEMETRIC_TOKEN) is required');
}

export const vemetric = new Vemetric({
  host: `${getVemetricUrl('hub')}`,
  token: insightToken,
});
