export async function onRequestGet(context) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  };

  try {
    const scriptUrl = context.env.INQUIRY_SCRIPT_URL;
    const siteKey = context.env.TURNSTILE_SITE_KEY;

    if (!scriptUrl || !siteKey) {
      throw new Error('Missing configuration');
    }

    const url = new URL(scriptUrl);

    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'script.google.com' ||
      !url.pathname.endsWith('/exec')
    ) {
      throw new Error('Invalid configuration');
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Accept: 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error('Upstream request failed');
    }

    const data = await response.json();

    if (typeof data.enabled !== 'boolean') {
      throw new Error('Invalid upstream response');
    }

    return new Response(
      JSON.stringify({
        ok: true,
        enabled: data.enabled,
        siteKey: siteKey
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        enabled: false,
        message: '현재 문의 양식을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.'
      }),
      { status: 503, headers }
    );
  }
}
