import { createClient } from '@supabase/supabase-js';
import {
  SEED_COUNTRIES,
  SEED_FIELDS,
  SEED_PROVIDERS,
  SEED_SCHOLARSHIPS,
  SEED_GUIDES,
} from '../src/lib/data/seed-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function seed() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
    console.log('Seed data is ready and structured in src/lib/data/seed-data.ts');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  console.log('Connecting to Supabase at:', supabaseUrl);

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
  if (countriesErr) console.error('Error seeding countries:', countriesErr);
  else console.log(`✓ Seeded ${SEED_COUNTRIES.length} countries`);

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
  if (fieldsErr) console.error('Error seeding fields:', fieldsErr);
  else console.log(`✓ Seeded ${SEED_FIELDS.length} fields`);

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
  if (providersErr) console.error('Error seeding providers:', providersErr);
  else console.log(`✓ Seeded ${SEED_PROVIDERS.length} providers`);

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
  if (scholarshipsErr) console.error('Error seeding scholarships:', scholarshipsErr);
  else console.log(`✓ Seeded ${SEED_SCHOLARSHIPS.length} scholarships`);

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
  if (guidesErr) console.error('Error seeding guides:', guidesErr);
  else console.log(`✓ Seeded ${SEED_GUIDES.length} guides`);

  console.log('Supabase seeding finished successfully!');
}

seed().catch(console.error);
