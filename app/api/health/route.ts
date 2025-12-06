import { NextResponse } from 'next/server'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const healthStatus: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      supabase: {
        configured: isSupabaseConfigured,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '***configured***' : 'not-set',
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    }

    // If Supabase is configured, try a simple query
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('count')
          .limit(1)

        healthStatus.supabase = {
          ...healthStatus.supabase,
          connected: !error,
          connectionError: error?.message || null
        }
      } catch (err) {
        healthStatus.supabase = {
          ...healthStatus.supabase,
          connected: false,
          connectionError: err instanceof Error ? err.message : 'Unknown error'
        }
      }
    }

    return NextResponse.json(healthStatus)
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}