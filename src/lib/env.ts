/**
 * Centralized Environment Validation and Configuration for Grantly
 * Validates variables at runtime and startup without exposing secrets.
 */

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  environment: 'production' | 'development' | 'test';
}

export function validateEnv(explicitProd?: boolean): EnvValidationResult {
  const isProd = explicitProd ?? process.env.NODE_ENV === 'production';
  const environment = (process.env.NODE_ENV as 'production' | 'development' | 'test') || 'development';
  const errors: string[] = [];
  const warnings: string[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // Supabase URL validation
  if (!supabaseUrl) {
    if (isProd) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is required in production.');
    } else {
      warnings.push('NEXT_PUBLIC_SUPABASE_URL is not set. Local mock/fallback store will be used.');
    }
  } else {
    try {
      const parsed = new URL(supabaseUrl);
      if (isProd && parsed.protocol !== 'https:') {
        errors.push('NEXT_PUBLIC_SUPABASE_URL must use https in production.');
      }
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL.');
    }
  }

  // Supabase Anon Key validation
  if (!supabaseAnon) {
    if (isProd) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required in production.');
    } else {
      warnings.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.');
    }
  } else if (supabaseAnon.length < 20) {
    warnings.push('NEXT_PUBLIC_SUPABASE_ANON_KEY appears abnormally short.');
  }

  // Site URL validation
  if (siteUrl) {
    try {
      new URL(siteUrl);
    } catch {
      errors.push('NEXT_PUBLIC_SITE_URL is not a valid URL.');
    }
  } else if (isProd) {
    warnings.push('NEXT_PUBLIC_SITE_URL is not explicitly set; defaulting to origin.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    environment,
  };
}

export const envConfig = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    isConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
  },
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  allowDevMockAdmin: process.env.NEXT_PUBLIC_ALLOW_DEV_MOCK_ADMIN === 'true',
};
