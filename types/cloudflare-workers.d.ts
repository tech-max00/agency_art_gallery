declare module "cloudflare:workers" {
  export const env: {
    DB?: import("@miniflare/d1").D1Database;
  };
}

type D1Database = import("@miniflare/d1").D1Database;

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}
