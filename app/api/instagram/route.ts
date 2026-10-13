const FIELDS = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,children{id,media_type,media_url,thumbnail_url}';

type InstagramResponse = {
  data?: unknown[];
  paging?: { next?: string };
  error?: { message?: string };
};

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return Response.json(
      { data: [], connected: false, message: 'Instagram ist noch nicht verbunden.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    let next: string | undefined = `https://graph.instagram.com/me/media?fields=${FIELDS}&limit=100&access_token=${encodeURIComponent(token)}`;
    const posts: unknown[] = [];

    // Follow pagination so the gallery can grow without source-code changes.
    while (next && posts.length < 300) {
      const response = await fetch(next, { headers: { Accept: 'application/json' } });
      const payload = await response.json() as InstagramResponse;
      if (!response.ok || payload.error) throw new Error(payload.error?.message || 'Instagram request failed');
      posts.push(...(payload.data || []));
      next = payload.paging?.next;
    }

    return Response.json(
      { data: posts, connected: true },
      { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400' } },
    );
  } catch (error) {
    console.error('Instagram feed could not be loaded', error);
    return Response.json(
      { data: [], connected: false, message: 'Der Instagram-Feed ist vorübergehend nicht erreichbar.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
