import {getCLS, getFID, getLCP} from 'web-vitals';
import sendToClientAnalytics from './send-to-client-analytics';

export default function traceWebVitals(config) {
  const sendToClientAnalyticsCurry = data => {
    if (data?.isFinal) {
      return sendToClientAnalytics({
        ...config,
        webVitalsName: data?.name,
        webVitalsValue: Math.round((data?.value + Number.EPSILON) * 100) / 100,
      });
    }
    return () => {};
  };

  getCLS(sendToClientAnalyticsCurry);
  getFID(sendToClientAnalyticsCurry);
  getLCP(sendToClientAnalyticsCurry);
}
