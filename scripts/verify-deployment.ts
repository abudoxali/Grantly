import * as http from 'http';
import * as https from 'https';

const targetUrl = process.env.TARGET_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

console.log(`=== Grantly Post-Deployment Smoke Verification ===`);
console.log(`Target Host: ${targetUrl}\n`);

interface CheckResult {
  title: string;
  passed: boolean;
  message?: string;
}

const results: CheckResult[] = [];

function fetchUrl(
  urlStr: string,
  options: { redirectCount?: number; followRedirect?: boolean } = {}
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.get(urlStr, { timeout: 30000 }, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (
          options.followRedirect &&
          res.statusCode &&
          [301, 302, 307, 308].includes(res.statusCode) &&
          res.headers.location
        ) {
          const redirectTarget = new URL(res.headers.location, urlStr).toString();
          if ((options.redirectCount || 0) < 5) {
            resolve(fetchUrl(redirectTarget, { ...options, redirectCount: (options.redirectCount || 0) + 1 }));
            return;
          }
        }
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out after 30000ms'));
    });
  });
}

async function runVerification() {
  // 1. Health endpoint
  try {
    const res = await fetchUrl(`${targetUrl}/api/health`);
    if (res.statusCode === 200 && res.body.includes('"status":"ok"')) {
      results.push({ title: 'Liveness Endpoint (/api/health) returns 200 OK', passed: true });
    } else {
      results.push({
        title: 'Liveness Endpoint (/api/health)',
        passed: false,
        message: `Status: ${res.statusCode}, Body: ${res.body.slice(0, 100)}`,
      });
    }
  } catch (err: unknown) {
    results.push({
      title: 'Liveness Endpoint (/api/health)',
      passed: false,
      message: `Failed to connect: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // 2. Readiness endpoint
  try {
    const res = await fetchUrl(`${targetUrl}/api/ready`);
    if (res.statusCode === 200 || res.statusCode === 503) {
      results.push({
        title: `Readiness Endpoint (/api/ready) responded (Status: ${res.statusCode})`,
        passed: true,
      });
    } else {
      results.push({
        title: 'Readiness Endpoint (/api/ready)',
        passed: false,
        message: `Unexpected status code: ${res.statusCode}`,
      });
    }
  } catch (err: unknown) {
    results.push({
      title: 'Readiness Endpoint (/api/ready)',
      passed: false,
      message: `Failed to connect: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // 3. English home & security headers
  try {
    const res = await fetchUrl(`${targetUrl}/en`);
    if (res.statusCode === 200) {
      const hasNosniff = res.headers['x-content-type-options'] === 'nosniff';
      const hasXfo = res.headers['x-frame-options'] === 'DENY';
      if (hasNosniff && hasXfo) {
        results.push({
          title: 'English Home (/en) returns 200 with hardened security headers',
          passed: true,
        });
      } else {
        results.push({
          title: 'English Home (/en) security headers check',
          passed: false,
          message: `Headers received: ${JSON.stringify(res.headers)}`,
        });
      }
    } else {
      results.push({
        title: 'English Home (/en)',
        passed: false,
        message: `Status: ${res.statusCode}`,
      });
    }
  } catch (err: unknown) {
    results.push({
      title: 'English Home (/en)',
      passed: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // 4. Arabic home
  try {
    const res = await fetchUrl(`${targetUrl}/ar`);
    if (res.statusCode === 200) {
      results.push({ title: 'Arabic Home (/ar) returns 200 OK', passed: true });
    } else {
      results.push({
        title: 'Arabic Home (/ar)',
        passed: false,
        message: `Status: ${res.statusCode}`,
      });
    }
  } catch (err: unknown) {
    results.push({
      title: 'Arabic Home (/ar)',
      passed: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // 5. Admin route protection
  try {
    const res = await fetchUrl(`${targetUrl}/en/admin`, { followRedirect: false });
    if ([301, 302, 307, 308].includes(res.statusCode)) {
      const location = res.headers.location || '';
      if (location.includes('/admin/login')) {
        results.push({
          title: 'Admin Route (/en/admin) blocks unauthenticated access with login redirect',
          passed: true,
        });
      } else {
        results.push({
          title: 'Admin Route (/en/admin) redirected to unexpected destination',
          passed: false,
          message: `Location: ${location}`,
        });
      }
    } else if (res.statusCode === 200 && res.body.includes('Admin Access Only')) {
      results.push({
        title: 'Admin Route (/en/admin) rendered client security boundary fallback',
        passed: true,
      });
    } else {
      results.push({
        title: 'Admin Route (/en/admin) protection check',
        passed: false,
        message: `Unexpected status ${res.statusCode}`,
      });
    }
  } catch (err: unknown) {
    results.push({
      title: 'Admin Route (/en/admin)',
      passed: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // Output summary
  console.log('\n--- Verification Results ---');
  let hasFailures = false;
  for (const r of results) {
    if (r.passed) {
      console.log(`✓ PASS: ${r.title}`);
    } else {
      console.error(`❌ FAIL: ${r.title}${r.message ? ` - ${r.message}` : ''}`);
      hasFailures = true;
    }
  }

  if (hasFailures) {
    console.error('\nDeployment verification failed.');
    process.exit(1);
  } else {
    console.log('\n✓ All smoke verification checks passed successfully.');
  }
}

runVerification().catch((err) => {
  console.error('Fatal verification runner error:', err);
  process.exit(1);
});
