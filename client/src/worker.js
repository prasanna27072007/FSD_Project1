import { DurableObject } from 'cloudflare:workers';

const PORT = 8080;
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000;

export class Backend extends DurableObject {
  starting;

  constructor(ctx, env) {
    super(ctx, env);
    if (ctx.container.running) {
      void ctx.blockConcurrencyWhile(() => ctx.container.setInactivityTimeout(INACTIVITY_TIMEOUT_MS));
    }
  }

  async fetch(request) {
    this.starting ??= this.startAndWaitForPort().finally(() => {
      this.starting = undefined;
    });
    await this.starting;

    const url = new URL(request.url);
    url.protocol = 'http:';
    url.host = 'container';
    const forwarded = new Request(url, request);
    forwarded.headers.delete('host');
    // The browser and API share this Worker origin; the container does not need
    // the browser's Origin header for same-origin API or Socket.IO requests.
    forwarded.headers.delete('origin');
    return this.ctx.container.getTcpPort(PORT).fetch(forwarded);
  }

  async startAndWaitForPort() {
    const container = this.ctx.container;
    if (!container.running) {
      const { MONGO_URI, JWT_SECRET, AI_MODE, AI_PROVIDER, AI_API_KEY } = this.env;
      container.start({
        image: container.images.base,
        instance: 'lite',
        enableInternet: true,
        env: {
          PORT: String(PORT),
          NODE_ENV: 'production',
          ALLOW_MEMORY_FALLBACK: 'false',
          MONGO_URI,
          JWT_SECRET,
          CLIENT_URL: 'http://localhost',
          AI_MODE,
          AI_PROVIDER,
          AI_API_KEY,
        },
      });
    }

    await container.setInactivityTimeout(INACTIVITY_TIMEOUT_MS);
    const port = container.getTcpPort(PORT);
    let lastError;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      try {
        const response = await port.fetch('http://container/api/health', {
          signal: AbortSignal.timeout(1000),
        });
        await response.body?.cancel();
        if (!response.ok) throw new Error(`API health check returned ${response.status}`);
        return;
      } catch (error) {
        lastError = error;
        await scheduler.wait(200);
      }
    }

    throw new Error('Backend container did not become ready', { cause: lastError });
  }
}

export default {
  fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api' || pathname.startsWith('/api/') || pathname === '/socket.io' || pathname.startsWith('/socket.io/')) {
      return env.BACKEND.getByName('hdss-backend').fetch(request);
    }
    return env.ASSETS.fetch(request);
  },
};
