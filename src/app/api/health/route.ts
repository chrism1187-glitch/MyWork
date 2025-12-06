import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    const hasDb = !!dbUrl;
    const dbUrlPreview = dbUrl ? dbUrl.substring(0, 120) + '...' : 'NOT SET';
    const hostPort = (() => {
      if (!dbUrl) return 'NOT SET';
      try {
        const u = new URL(dbUrl.replace('postgresql://', 'http://'));
        return `${u.hostname}:${u.port || 'default'}`;
      } catch (e) {
        return 'PARSE_ERROR';
      }
    })();
    
    return NextResponse.json({
      status: 'ok',
      database: {
        configured: hasDb,
        preview: dbUrlPreview,
        hostPort,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      status: 'error',
      error: errorMsg,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
