/**
 * CIVIC Reporter — API Health Check
 * GET /api/health — Public health check endpoint
 */
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'CIVIC Reporter API',
  });
}
