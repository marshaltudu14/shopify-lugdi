import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sitemapSlug: string[] }> }
) {
  const {sitemapSlug} = await params
  const requestedSitemapPath = sitemapSlug.join('/');

  if (!requestedSitemapPath.startsWith('sitemap') || !requestedSitemapPath.endsWith('.xml')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const searchParams = request.nextUrl.search;

  const sourceDomain = 'https://shop.lugdi.store';
  const sourceSitemapUrl = `${sourceDomain}/${requestedSitemapPath}${searchParams}`;

  const targetDomain = process.env.NEXT_PUBLIC_SITE_URL || 'https://lugdi.store';

  const sourceDomainPattern = new RegExp(sourceDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');

  try {
    const response = await fetch(sourceSitemapUrl, {
      next: {
        revalidate: 60 * 60,
      },
    });

    if (!response.ok) {
      return new NextResponse(response.statusText || 'Sitemap not found at origin', { status: response.status });
    }

    let sitemapXml = await response.text();

    sitemapXml = sitemapXml.replace(sourceDomainPattern, targetDomain);

    sitemapXml = sitemapXml.replace(
      /(<loc>https?:\/\/[^<]+\/)(sitemap[^<]*\.xml)/g,
      (_match, prefix, filename) => `${prefix}sitemap/${filename}`
    );

    return new NextResponse(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error(`Error generating dynamic sitemap for ${requestedSitemapPath}:`, error);
    return new NextResponse('Error generating sitemap.', { status: 500 });
  }
}
