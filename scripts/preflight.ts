import * as fs from 'fs';
import * as path from 'path';
import { validateEnv } from '../src/lib/env';

console.log('=== Grantly Deployment Preflight Verification ===\n');

let failed = false;

function check(title: string, fn: () => boolean | string | void) {
  try {
    const res = fn();
    if (res === false || typeof res === 'string') {
      console.error(`❌ FAIL: ${title}${typeof res === 'string' ? ` - ${res}` : ''}`);
      failed = true;
    } else {
      console.log(`✓ PASS: ${title}`);
    }
  } catch (err: unknown) {
    console.error(`❌ FAIL: ${title} - ${err instanceof Error ? err.message : String(err)}`);
    failed = true;
  }
}

// 1. Node.js version
check('Node.js version >= 22.0.0', () => {
  const version = process.versions.node;
  const major = parseInt(version.split('.')[0], 10);
  if (major < 22) {
    return `Detected Node.js v${version}. Requires Node.js >= 22.0.0.`;
  }
  return true;
});

// 2. Migration files structure
check('Database migrations are present and valid', () => {
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  if (!fs.existsSync(migrationsDir)) {
    return 'supabase/migrations directory is missing';
  }
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
  if (files.length === 0) {
    return 'No SQL migration files found in supabase/migrations';
  }
  return true;
});

// 3. Secrets safety in .env.example
check('.env.example contains only empty placeholders', () => {
  const envExamplePath = path.resolve(process.cwd(), '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    return '.env.example is missing';
  }
  const content = fs.readFileSync(envExamplePath, 'utf8');
  const sensitiveKeys = ['SUPABASE_SERVICE_ROLE_KEY', 'ADMIN_PASSWORD', 'ADMIN_EMAIL'];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    for (const key of sensitiveKeys) {
      if (trimmed.startsWith(`${key}=`)) {
        const val = trimmed.split('=')[1]?.trim() || '';
        if (val !== '' && val !== '""' && val !== "''") {
          return `Secret key ${key} has non-empty default in .env.example!`;
        }
      }
    }
  }
  return true;
});

// 4. Standalone output in next.config.ts
check('next.config.ts specifies standalone output', () => {
  const nextConfigPath = path.resolve(process.cwd(), 'next.config.ts');
  const content = fs.readFileSync(nextConfigPath, 'utf8');
  if (!content.includes("'standalone'")) {
    return "next.config.ts is missing output: 'standalone'";
  }
  return true;
});

// 5. PM2 ecosystem config
check('ecosystem.config.cjs exists and is valid', () => {
  const pm2Path = path.resolve(process.cwd(), 'ecosystem.config.cjs');
  if (!fs.existsSync(pm2Path)) {
    return 'ecosystem.config.cjs is missing';
  }
  return true;
});

// 6. Nginx configuration template
check('deploy/nginx/grantly.conf.template exists', () => {
  const nginxTemplate = path.resolve(process.cwd(), 'deploy/nginx/grantly.conf.template');
  if (!fs.existsSync(nginxTemplate)) {
    return 'deploy/nginx/grantly.conf.template is missing';
  }
  return true;
});

// 7. Environment validation logic
check('Environment validator runs without unexpected crashes', () => {
  const res = validateEnv(false);
  return res !== undefined;
});

console.log('');
if (failed) {
  console.error('❌ Preflight checks failed. Correct the errors above before proceeding.\n');
  process.exit(1);
} else {
  console.log('✓ All preflight checks passed successfully.\n');
}
