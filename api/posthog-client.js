import { PostHog } from 'posthog-node';

const key = (process.env.POSTHOG_API_KEY || process.env.POSTHOG_KEY || '').trim();
const host = process.env.POSTHOG_HOST || 'https://us.i.posthog.com';

if (!key.startsWith('phc_')) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(
      'POSTHOG_API_KEY variable required by PostHog is missing or un-configured, ' +
      'this causes events to be silently missed. ' +
      'This error stops appearing once POSTHOG_API_KEY is configured'
    );
  }
}

export function createPostHogClient() {
  if (!key.startsWith('phc_')) return null;
  return new PostHog(key, {
    host,
    flushAt: 1,
    flushInterval: 0,
    enableExceptionAutocapture: true,
  });
}
