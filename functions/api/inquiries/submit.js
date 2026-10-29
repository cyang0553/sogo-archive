function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // 현재는 국문 아카이브에서 제출한 요청만 받습니다.
  if (request.headers.get('Origin') !== 'https://sogo-archive.pages.dev') {
    return jsonResponse({
      ok: false,
      message: '허용되지 않은 요청입니다.'
    }, 403);
  }

  if (
    !(request.headers.get('Content-Type') || '')
      .toLowerCase()
      .startsWith('application/json')
  ) {
    return jsonResponse({
      ok: false,
      message: '전송 형식이 올바르지 않습니다.'
    }, 415);
  }

  let input;

  try {
    // 길이 헤더뿐 아니라 실제 수신 용량도 제한합니다.
    const reader = request.body && request.body.getReader();

    if (!reader) throw new Error('Empty body');

    const chunks = [];
    let size = 0;

    while (true) {
      const result = await reader.read();

      if (result.done) break;

      size += result.value.byteLength;

      if (size > 60000) {
        await reader.cancel();

        return jsonResponse({
          ok: false,
          message: '입력 내용이 너무 깁니다.'
        }, 413);
      }

      chunks.push(result.value);
    }

    const bytes = new Uint8Array(size);
    let offset = 0;

    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    input = JSON.parse(new TextDecoder().decode(bytes));

    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new Error('Invalid body');
    }
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: '입력 내용을 확인해 주세요.'
    }, 400);
  }

  if (
    typeof input.requestId !== 'string' ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
      .test(input.requestId) ||
    typeof input.turnstileToken !== 'string' ||
    !input.turnstileToken ||
    input.turnstileToken.length > 2048 ||
    !input.payload ||
    typeof input.payload !== 'object' ||
    Array.isArray(input.payload)
  ) {
    return jsonResponse({
      ok: false,
      message: '필수 입력과 스팸 방지 확인을 완료해 주세요.'
    }, 400);
  }

  // 사람이 작성하지 않는 숨김 입력칸입니다.
  if (input.website) {
    return jsonResponse({
      ok: false,
      message: '요청을 확인할 수 없습니다.'
    }, 400);
  }

  try {
    if (!env.INQUIRY_SCRIPT_URL || !env.INQUIRY_SHARED_SECRET) {
      throw new Error('Missing configuration');
    }

    const scriptUrl = new URL(env.INQUIRY_SCRIPT_URL);

    if (
      scriptUrl.protocol !== 'https:' ||
      scriptUrl.hostname !== 'script.google.com' ||
      !scriptUrl.pathname.endsWith('/exec')
    ) {
      throw new Error('Invalid configuration');
    }

    const response = await fetch(scriptUrl.toString(), {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        secret: env.INQUIRY_SHARED_SECRET,
        requestId: input.requestId,
        turnstileToken: input.turnstileToken,
        payload: input.payload
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error('Upstream request failed');
    }

    const result = await response.json();

    if (result.ok === true) {
      return jsonResponse({
        ok: true,
        message: '문의가 전송되었습니다. 내용을 확인한 뒤 남겨주신 이메일로 회신드리겠습니다.'
      });
    }

    if (result.ok !== false) {
      throw new Error('Invalid upstream response');
    }

    return jsonResponse({
      ok: false,
      message: typeof result.message === 'string'
        ? result.message.slice(0, 500)
        : '전송하지 못했습니다. 입력 내용을 확인해 주세요.'
    }, 400);
  } catch (error) {
    // 타임아웃이어도 실제 메일이 발송됐을 수 있으므로
    // 서버에서 임의로 재전송하지 않습니다.
    return jsonResponse({
      ok: false,
      uncertain: true,
      message: '전송 결과를 확인하지 못했습니다. 입력 내용은 유지됩니다. 중복 제출을 피하려면 hello.sogoindex@gmail.com으로 확인해 주세요.'
    }, 503);
  }
}
