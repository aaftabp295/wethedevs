import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'wethedevs — Developer Comparisons & Guides';
    const topic = searchParams.get('topic') || 'AI & Developer Tools';
    const contentType = searchParams.get('type') || 'guide';
    const readTime = searchParams.get('readTime') || '5 min read';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px 70px',
            backgroundColor: '#090d16',
            color: '#f8fafc',
            fontFamily: 'sans-serif',
            backgroundImage:
              'radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 40%), radial-gradient(circle at 0% 100%, rgba(59, 130, 246, 0.12) 0%, transparent 40%)',
          }}
        >
          {/* Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  height: '40px',
                  width: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#090d16',
                  fontSize: '22px',
                  fontWeight: 800,
                }}
              >
                W
              </div>
              <span style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff' }}>
                wethedevs
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '999px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: '15px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <span>{contentType}</span>
              <span>•</span>
              <span>{topic}</span>
            </div>
          </div>

          {/* Main Title Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '40px 0' }}>
            <div
              style={{
                fontSize: title.length > 60 ? '48px' : '58px',
                fontWeight: 800,
                lineHeight: 1.15,
                color: '#ffffff',
                letterSpacing: '-0.03em',
                maxWidth: '1000px',
                display: '-webkit-box',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </div>
          </div>

          {/* Footer Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              fontSize: '18px',
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#10b981', fontWeight: 700 }}>wethedevs.com</span>
              <span>— Expert AI & Dev Tools Analysis</span>
            </div>
            <span>{readTime}</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'OG Error';
    return new Response(`Failed to generate OG Image: ${msg}`, { status: 500 });
  }
}
