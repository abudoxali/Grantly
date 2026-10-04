import { NextResponse } from 'next/server';
import { validateEnv, envConfig } from '@/lib/env';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const envValidation = validateEnv();
  const isProd = process.env.NODE_ENV === 'production';

  // If environment validation failed in production, mark service unready
  if (!envValidation.valid && isProd) {
    return NextResponse.json(
      {
        status: 'unready',
        service: 'grantly',
        database: 'unconfigured',
        environment: envValidation.environment,
        errors: envValidation.errors,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }

  let dbStatus: 'connected' | 'fallback_dev' | 'unreachable' = 'fallback_dev';

  if (envConfig.supabase.isConfigured) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('countries').select('id').limit(1);
        if (error) {
          dbStatus = 'unreachable';
        } else {
          dbStatus = 'connected';
        }
      } else {
        dbStatus = isProd ? 'unreachable' : 'fallback_dev';
      }
    } catch {
      dbStatus = 'unreachable';
    }
  }

  // In production, database must be connected to be ready
  if (isProd && dbStatus !== 'connected') {
    return NextResponse.json(
      {
        status: 'unready',
        service: 'grantly',
        database: dbStatus,
        environment: envValidation.environment,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }

  return NextResponse.json(
    {
      status: 'ready',
      service: 'grantly',
      database: dbStatus,
      environment: envValidation.environment,
      warnings: envValidation.warnings.length > 0 ? envValidation.warnings : undefined,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
