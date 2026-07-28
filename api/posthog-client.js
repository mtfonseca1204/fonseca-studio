const key = (process.env.POSTHOG_API_KEY || process.env.POSTHOG_KEY || '').trim();
const host = (process.env.POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/$/, '');

export function isPostHogConfigured() {
  return key.startsWith('phc_');
}

export async function capturePostHogEvent(distinctId, event, properties = {}) {
  if (!isPostHogConfigured()) return;
  try {
    await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        event,
        distinct_id: distinctId || 'anonymous',
        properties,
      }),
    });
  } catch {
    // Analytics must never break chat.
  }
}

export async function capturePostHogException(distinctId, error, properties = {}) {
  if (!isPostHogConfigured()) return;
  await capturePostHogEvent(distinctId, '$exception', {
    ...properties,
    $exception_message: error?.message || String(error),
    $exception_type: error?.name || 'Error',
  });
}
