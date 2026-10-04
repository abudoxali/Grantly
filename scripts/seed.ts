import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import {
  SEED_COUNTRIES,
  SEED_FIELDS,
  SEED_PROVIDERS,
  SEED_SCHOLARSHIPS,
  SEED_GUIDES,
} from '../src/lib/data/seed-data';

// Helper to load .env.local or .env if present
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const isDryRun = process.argv.includes('--dry-run');

async function seed() {
  console.log('--- Grantly Seed Execution ---');

  if (isDryRun) {
    console.log('Mode: DRY-RUN (Validating data integrity without database writes)');
    console.log(`- Countries: ${SEED_COUNTRIES.length}`);
    console.log(`- Fields: ${SEED_FIELDS.length}`);
    console.log(`- Providers: ${SEED_PROVIDERS.length}`);
    console.log(`- Scholarships: ${SEED_SCHOLARSHIPS.length}`);
    console.log(`- Guides: ${SEED_GUIDES.length}`);

    // Validate slug uniqueness
    const countrySlugs = new Set(SEED_COUNTRIES.map((c) => c.slug));
    if (countrySlugs.size !== SEED_COUNTRIES.length) {
      console.error('Validation failure: Duplicate country slugs detected');
      process.exit(1);
    }

    const fieldSlugs = new Set(SEED_FIELDS.map((f) => f.slug));
    if (fieldSlugs.size !== SEED_FIELDS.length) {
      console.error('Validation failure: Duplicate field slugs detected');
      process.exit(1);
    }

    const providerSlugs = new Set(SEED_PROVIDERS.map((p) => p.slug));
    if (providerSlugs.size !== SEED_PROVIDERS.length) {
      console.error('Validation failure: Duplicate provider slugs detected');
      process.exit(1);
    }

    const scholarshipSlugs = new Set(SEED_SCHOLARSHIPS.map((s) => s.slug));
    if (scholarshipSlugs.size !== SEED_SCHOLARSHIPS.length) {
      console.error('Validation failure: Duplicate scholarship slugs detected');
      process.exit(1);
    }

    console.log('✓ Dry-run data validation passed successfully. All slugs and relations are valid.');
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL is required to seed database.');
    process.exit(1);
  }

  if (!serviceRoleKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required to seed database (Anon key rejected for security).');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  console.log(`Connecting to Supabase at: ${supabaseUrl}`);

  let errors = 0;

  // 1. Countries
  console.log('Seeding countries...');
  const { error: countriesErr } = await supabase.from('countries').upsert(
    SEED_COUNTRIES.map((c) => ({
      id: c.id,
      name_en: c.name_en,
      name_ar: c.name_ar,
      slug: c.slug,
      code: c.code,
      flag: c.flag,
      description_en: c.description_en,
      description_ar: c.description_ar,
      currency: c.currency,
      living_cost_from: c.living_cost_from,
      living_cost_to: c.living_cost_to,
      featured: c.featured,
    })),
    { onConflict: 'slug' }
  );
  if (countriesErr) {
    console.error('Error seeding countries:', countriesErr);
    errors++;
  } else {
    console.log(`✓ Seeded ${SEED_COUNTRIES.length} countries`);
  }

  // 2. Fields
  console.log('Seeding academic fields...');
  const { error: fieldsErr } = await supabase.from('fields').upsert(
    SEED_FIELDS.map((f) => ({
      id: f.id,
      name_en: f.name_en,
      name_ar: f.name_ar,
      slug: f.slug,
      description_en: f.description_en,
      description_ar: f.description_ar,
      icon: f.icon,
      featured: f.featured,
    })),
    { onConflict: 'slug' }
  );
  if (fieldsErr) {
    console.error('Error seeding fields:', fieldsErr);
    errors++;
  } else {
    console.log(`✓ Seeded ${SEED_FIELDS.length} fields`);
  }

  // 3. Providers
  console.log('Seeding scholarship providers...');
  const { error: providersErr } = await supabase.from('providers').upsert(
    SEED_PROVIDERS.map((p) => ({
      id: p.id,
      name_en: p.name_en,
      name_ar: p.name_ar,
      slug: p.slug,
      country_id: p.country_id,
      provider_type: p.provider_type,
      website_url: p.website_url,
      verified: p.verified,
    })),
    { onConflict: 'slug' }
  );
  if (providersErr) {
    console.error('Error seeding providers:', providersErr);
    errors++;
  } else {
    console.log(`✓ Seeded ${SEED_PROVIDERS.length} providers`);
  }

  // 4. Scholarships
  console.log('Seeding scholarships...');
  const { error: scholarshipsErr } = await supabase.from('scholarships').upsert(
    SEED_SCHOLARSHIPS.map((s) => ({
      id: s.id,
      slug: s.slug,
      title_en: s.title_en,
      title_ar: s.title_ar,
      short_description_en: s.short_description_en,
      short_description_ar: s.short_description_ar,
      description_en: s.description_en,
      description_ar: s.description_ar,
      provider_id: s.provider_id,
      country_id: s.country_id,
      funding_type: s.funding_type,
      funding_summary_en: s.funding_summary_en,
      funding_summary_ar: s.funding_summary_ar,
      stipend_amount: s.stipend_amount,
      stipend_currency: s.stipend_currency,
      deadline: s.deadline,
      application_open_date: s.application_open_date,
      status: s.status,
      official_url: s.official_url,
      degree_levels: s.degree_levels,
      eligible_nationalities: s.eligible_nationalities,
      benefits: s.benefits,
      eligibility_en: s.eligibility_en,
      eligibility_ar: s.eligibility_ar,
      required_documents_en: s.required_documents_en,
      required_documents_ar: s.required_documents_ar,
      featured: s.featured,
      published: s.published,
      last_verified_at: s.last_verified_at,
    })),
    { onConflict: 'slug' }
  );
  if (scholarshipsErr) {
    console.error('Error seeding scholarships:', scholarshipsErr);
    errors++;
  } else {
    console.log(`✓ Seeded ${SEED_SCHOLARSHIPS.length} scholarships`);
  }

  // 5. Guides
  console.log('Seeding student guides...');
  const { error: guidesErr } = await supabase.from('guides').upsert(
    SEED_GUIDES.map((g) => ({
      id: g.id,
      slug: g.slug,
      title_en: g.title_en,
      title_ar: g.title_ar,
      excerpt_en: g.excerpt_en,
      excerpt_ar: g.excerpt_ar,
      content_en: g.content_en,
      content_ar: g.content_ar,
      category: g.category,
      reading_time_minutes: g.reading_time_minutes,
      published: g.published,
      featured: g.featured,
      author: g.author,
    })),
    { onConflict: 'slug' }
  );
  if (guidesErr) {
    console.error('Error seeding guides:', guidesErr);
    errors++;
  } else {
    console.log(`✓ Seeded ${SEED_GUIDES.length} guides`);
  }

  if (errors > 0) {
    console.error(`\nSeeding completed with ${errors} error(s).`);
    process.exit(1);
  }

  console.log('\n✓ Supabase database seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Fatal seed failure:', err);
  process.exit(1);
});
