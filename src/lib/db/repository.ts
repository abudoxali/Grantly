/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type {
  Scholarship,
  Country,
  Field,
  Guide,
  Bookmark,
  Profile,
  DegreeLevel,
  FundingType,
  ScholarshipStatus,
} from '@/lib/supabase/types';
import {
  SEED_SCHOLARSHIPS,
  SEED_COUNTRIES,
  SEED_FIELDS,
  SEED_PROVIDERS,
  SEED_GUIDES,
} from '@/lib/data/seed-data';

// In-memory / storage fallback store for local development or when Supabase keys are not set
class LocalDataStore {
  scholarships: Scholarship[] = [...SEED_SCHOLARSHIPS];
  countries: Country[] = [...SEED_COUNTRIES];
  fields: Field[] = [...SEED_FIELDS];
  guides: Guide[] = [...SEED_GUIDES];
  bookmarks: Bookmark[] = [];
  profiles: Profile[] = [
    {
      id: 'admin-seed-id',
      email: 'admin@grantly.org',
      full_name: 'Grantly Admin',
      role: 'admin',
      preferred_language: 'en',
      country: 'United Kingdom',
      degree_level: 'Master',
      academic_field: 'Computer Science',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-student-id',
      email: 'student@example.com',
      full_name: 'Sarah Al-Mansoor',
      role: 'user',
      preferred_language: 'ar',
      country: 'Saudi Arabia',
      degree_level: 'Master',
      academic_field: 'Engineering',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  constructor() {
    // Populate relations for seed scholarships
    this.hydrateScholarships();
  }

  hydrateScholarships() {
    this.scholarships = this.scholarships.map((s) => ({
      ...s,
      country: this.countries.find((c) => c.id === s.country_id),
      provider: SEED_PROVIDERS.find((p) => p.id === s.provider_id),
    }));
  }
}

// Global singleton for local store across client or server requests in same process
const globalStore = new LocalDataStore();

export interface ScholarshipFilters {
  query?: string;
  degrees?: DegreeLevel[];
  fundingTypes?: FundingType[];
  countries?: string[];
  fields?: string[];
  statuses?: ScholarshipStatus[];
  featuredOnly?: boolean;
  publishedOnly?: boolean;
  sortBy?: 'deadline-asc' | 'deadline-desc' | 'popular' | 'newest';
}

function assertProductionConfig() {
  if (
    process.env.NODE_ENV === 'production' &&
    !isSupabaseConfigured &&
    process.env.ALLOW_LOCAL_MOCK !== 'true'
  ) {
    throw new Error(
      'Grantly production configuration error: Supabase is not configured. Live Supabase connection is required in production.'
    );
  }
}

export async function getScholarships(
  filters: ScholarshipFilters = {},
  locale: 'en' | 'ar' = 'en'
): Promise<{ scholarships: Scholarship[]; total: number }> {
  assertProductionConfig();
  const supabase = createClient();

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('scholarships').select(
        `
        *,
        country:countries(*),
        provider:providers(*)
      `,
        { count: 'exact' }
      );

      if (filters.publishedOnly !== false) {
        query = query.eq('published', true);
      }

      if (filters.featuredOnly) {
        query = query.eq('featured', true);
      }

      if (filters.fundingTypes && filters.fundingTypes.length > 0) {
        query = query.in('funding_type', filters.fundingTypes);
      }

      if (filters.statuses && filters.statuses.length > 0) {
        query = query.in('status', filters.statuses);
      }

      const { data, count, error } = await query;
      if (!error && data) {
        let results = data as Scholarship[];

        // Apply in-memory text/array filtering for complex query
        if (filters.query) {
          const q = filters.query.toLowerCase();
          results = results.filter((s) => {
            const title = (locale === 'ar' ? s.title_ar : s.title_en).toLowerCase();
            const desc = (locale === 'ar' ? s.short_description_ar || '' : s.short_description_en || '').toLowerCase();
            const countryName = (locale === 'ar' ? s.country?.name_ar || '' : s.country?.name_en || '').toLowerCase();
            return title.includes(q) || desc.includes(q) || countryName.includes(q);
          });
        }

        if (filters.degrees && filters.degrees.length > 0) {
          results = results.filter((s) =>
            s.degree_levels.some((d) => filters.degrees?.includes(d))
          );
        }

        if (filters.countries && filters.countries.length > 0) {
          results = results.filter(
            (s) => s.country && filters.countries?.includes(s.country.name_en)
          );
        }

        // Sorting
        results = sortScholarships(results, filters.sortBy);

        return { scholarships: results, total: count || results.length };
      }
    } catch {
      // Fall through to local store on Supabase error
    }
  }

  // Local store fallback
  let list = globalStore.scholarships;

  if (filters.publishedOnly !== false) {
    list = list.filter((s) => s.published);
  }

  if (filters.featuredOnly) {
    list = list.filter((s) => s.featured);
  }

  if (filters.fundingTypes && filters.fundingTypes.length > 0) {
    list = list.filter((s) => filters.fundingTypes?.includes(s.funding_type));
  }

  if (filters.statuses && filters.statuses.length > 0) {
    list = list.filter((s) => filters.statuses?.includes(s.status));
  }

  if (filters.degrees && filters.degrees.length > 0) {
    list = list.filter((s) =>
      s.degree_levels.some((d) => filters.degrees?.includes(d))
    );
  }

  if (filters.countries && filters.countries.length > 0) {
    list = list.filter(
      (s) => s.country && filters.countries?.includes(s.country.name_en)
    );
  }

  if (filters.query) {
    const q = filters.query.toLowerCase().trim();
    list = list.filter((s) => {
      const titleEn = s.title_en.toLowerCase();
      const titleAr = s.title_ar.toLowerCase();
      const countryEn = s.country?.name_en.toLowerCase() || '';
      const countryAr = s.country?.name_ar.toLowerCase() || '';
      const providerEn = s.provider?.name_en.toLowerCase() || '';
      const providerAr = s.provider?.name_ar.toLowerCase() || '';
      const descEn = (s.short_description_en || '').toLowerCase();
      const descAr = (s.short_description_ar || '').toLowerCase();

      return (
        titleEn.includes(q) ||
        titleAr.includes(q) ||
        countryEn.includes(q) ||
        countryAr.includes(q) ||
        providerEn.includes(q) ||
        providerAr.includes(q) ||
        descEn.includes(q) ||
        descAr.includes(q)
      );
    });
  }

  list = sortScholarships(list, filters.sortBy);

  return { scholarships: list, total: list.length };
}

function sortScholarships(
  list: Scholarship[],
  sortBy: ScholarshipFilters['sortBy']
): Scholarship[] {
  const sorted = [...list];
  switch (sortBy) {
    case 'deadline-asc':
      return sorted.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    case 'deadline-desc':
      return sorted.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      });
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case 'popular':
    default:
      return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
}

export async function getScholarshipBySlug(slug: string): Promise<Scholarship | null> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select(
          `
          *,
          country:countries(*),
          provider:providers(*)
        `
        )
        .eq('slug', slug)
        .single();

      if (!error && data) {
        return data as Scholarship;
      }
    } catch {
      // Fallback
    }
  }

  const found = globalStore.scholarships.find((s) => s.slug === slug);
  return found || null;
}

export async function createScholarship(
  data: Omit<Scholarship, 'id' | 'created_at' | 'updated_at'>
): Promise<Scholarship> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    const { data: created, error } = await supabase
      .from('scholarships')
      .insert(data as any)
      .select('*, country:countries(*), provider:providers(*)')
      .single();
    if (error) {
      throw new Error(`Database error creating scholarship: ${error.message}`);
    }
    if (created) {
      return created as Scholarship;
    }
  }

  const newScholarship: Scholarship = {
    ...data,
    id: `sch-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    country: globalStore.countries.find((c) => c.id === data.country_id),
    provider: SEED_PROVIDERS.find((p) => p.id === data.provider_id),
  };

  globalStore.scholarships.unshift(newScholarship);
  return newScholarship;
}

export async function updateScholarship(
  id: string,
  updates: Partial<Scholarship>
): Promise<Scholarship | null> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    const { data: updated, error } = await (supabase as any)
      .from('scholarships')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, country:countries(*), provider:providers(*)')
      .single();
    if (error) {
      throw new Error(`Database error updating scholarship: ${error.message}`);
    }
    if (updated) {
      return updated as Scholarship;
    }
  }

  const idx = globalStore.scholarships.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  globalStore.scholarships[idx] = {
    ...globalStore.scholarships[idx],
    ...updates,
    updated_at: new Date().toISOString(),
    country: updates.country_id
      ? globalStore.countries.find((c) => c.id === updates.country_id)
      : globalStore.scholarships[idx].country,
  };
  return globalStore.scholarships[idx];
}

export async function deleteScholarship(id: string): Promise<boolean> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('scholarships').delete().eq('id', id);
    if (error) {
      throw new Error(`Database error deleting scholarship: ${error.message}`);
    }
    return true;
  }

  const initialLen = globalStore.scholarships.length;
  globalStore.scholarships = globalStore.scholarships.filter((s) => s.id !== id);
  return globalStore.scholarships.length < initialLen;
}

// ==============================================================================
// COUNTRIES REPOSITORY
// ==============================================================================

export async function getCountries(): Promise<Country[]> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name_en');
      if (!error && data) return data as Country[];
    } catch {
      // Fallback
    }
  }

  return [...globalStore.countries];
}

export async function getCountryBySlug(slug: string): Promise<Country | null> {
  assertProductionConfig();
  const countries = await getCountries();
  return countries.find((c) => c.slug === slug) || null;
}

export async function createCountry(
  data: Omit<Country, 'id' | 'created_at' | 'updated_at'>
): Promise<Country> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    const { data: created, error } = await supabase
      .from('countries')
      .insert(data as any)
      .select()
      .single();
    if (error) throw new Error(`Database error creating country: ${error.message}`);
    if (created) return created as Country;
  }

  const newCountry: Country = {
    ...data,
    id: `c-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  globalStore.countries.push(newCountry);
  return newCountry;
}

export async function updateCountry(
  id: string,
  updates: Partial<Country>
): Promise<Country | null> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    const { data: updated, error } = await (supabase as any)
      .from('countries')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Database error updating country: ${error.message}`);
    if (updated) return updated as Country;
  }

  const idx = globalStore.countries.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  globalStore.countries[idx] = {
    ...globalStore.countries[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return globalStore.countries[idx];
}

export async function deleteCountry(id: string): Promise<boolean> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('countries').delete().eq('id', id);
    if (error) throw new Error(`Database error deleting country: ${error.message}`);
    return true;
  }

  const initial = globalStore.countries.length;
  globalStore.countries = globalStore.countries.filter((c) => c.id !== id);
  return globalStore.countries.length < initial;
}

// ==============================================================================
// FIELDS REPOSITORY
// ==============================================================================

export async function getFields(): Promise<Field[]> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('fields').select('*').order('name_en');
      if (!error && data) return data as Field[];
    } catch {
      // Fallback
    }
  }

  return [...globalStore.fields];
}

export async function getFieldBySlug(slug: string): Promise<Field | null> {
  assertProductionConfig();
  const fields = await getFields();
  return fields.find((f) => f.slug === slug) || null;
}

export async function createField(
  data: Omit<Field, 'id' | 'created_at' | 'updated_at'>
): Promise<Field> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    const { data: created, error } = await supabase
      .from('fields')
      .insert(data as any)
      .select()
      .single();
    if (error) throw new Error(`Database error creating field: ${error.message}`);
    if (created) return created as Field;
  }

  const newField: Field = {
    ...data,
    id: `f-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  globalStore.fields.push(newField);
  return newField;
}

export async function updateField(
  id: string,
  updates: Partial<Field>
): Promise<Field | null> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    const { data: updated, error } = await (supabase as any)
      .from('fields')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Database error updating field: ${error.message}`);
    if (updated) return updated as Field;
  }

  const idx = globalStore.fields.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  globalStore.fields[idx] = {
    ...globalStore.fields[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return globalStore.fields[idx];
}

export async function deleteField(id: string): Promise<boolean> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('fields').delete().eq('id', id);
    if (error) throw new Error(`Database error deleting field: ${error.message}`);
    return true;
  }

  const initial = globalStore.fields.length;
  globalStore.fields = globalStore.fields.filter((f) => f.id !== id);
  return globalStore.fields.length < initial;
}

// ==============================================================================
// GUIDES REPOSITORY
// ==============================================================================

export async function getGuides(publishedOnly = true): Promise<Guide[]> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('guides').select('*').order('created_at', { ascending: false });
      if (publishedOnly) {
        query = query.eq('published', true);
      }
      const { data, error } = await query;
      if (!error && data) return data as Guide[];
    } catch {
      // Fallback
    }
  }

  if (publishedOnly) {
    return globalStore.guides.filter((g) => g.published);
  }
  return [...globalStore.guides];
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  assertProductionConfig();
  const guides = await getGuides(false);
  return guides.find((g) => g.slug === slug) || null;
}

export async function createGuide(
  data: Omit<Guide, 'id' | 'created_at' | 'updated_at'>
): Promise<Guide> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    const { data: created, error } = await supabase
      .from('guides')
      .insert(data as any)
      .select()
      .single();
    if (error) throw new Error(`Database error creating guide: ${error.message}`);
    if (created) return created as Guide;
  }

  const newGuide: Guide = {
    ...data,
    id: `g-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  globalStore.guides.unshift(newGuide);
  return newGuide;
}

export async function updateGuide(
  id: string,
  updates: Partial<Guide>
): Promise<Guide | null> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    const { data: updated, error } = await (supabase as any)
      .from('guides')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Database error updating guide: ${error.message}`);
    if (updated) return updated as Guide;
  }

  const idx = globalStore.guides.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  globalStore.guides[idx] = {
    ...globalStore.guides[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return globalStore.guides[idx];
}

export async function deleteGuide(id: string): Promise<boolean> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('guides').delete().eq('id', id);
    if (error) throw new Error(`Database error deleting guide: ${error.message}`);
    return true;
  }

  const initial = globalStore.guides.length;
  globalStore.guides = globalStore.guides.filter((g) => g.id !== id);
  return globalStore.guides.length < initial;
}

// ==============================================================================
// BOOKMARKS REPOSITORY
// ==============================================================================

export async function getBookmarks(userId: string): Promise<Bookmark[]> {
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(
          `
          *,
          scholarship:scholarships(
            *,
            country:countries(*),
            provider:providers(*)
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) return data as Bookmark[];
    } catch {
      // Fallback
    }
  }

  return globalStore.bookmarks
    .filter((b) => b.user_id === userId)
    .map((b) => ({
      ...b,
      scholarship: globalStore.scholarships.find((s) => s.id === b.scholarship_id),
    }));
}

export async function addBookmark(
  userId: string,
  scholarshipId: string
): Promise<Bookmark> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({ user_id: userId, scholarship_id: scholarshipId } as any)
      .select(
        `
        *,
        scholarship:scholarships(
          *,
          country:countries(*),
          provider:providers(*)
        )
      `
      )
      .single();
    if (error) {
      throw new Error(`Database error adding bookmark: ${error.message}`);
    }
    if (data) return data as Bookmark;
  }

  const existing = globalStore.bookmarks.find(
    (b) => b.user_id === userId && b.scholarship_id === scholarshipId
  );
  if (existing) return existing;

  const newBookmark: Bookmark = {
    id: `bm-${Date.now()}`,
    user_id: userId,
    scholarship_id: scholarshipId,
    created_at: new Date().toISOString(),
    scholarship: globalStore.scholarships.find((s) => s.id === scholarshipId),
  };
  globalStore.bookmarks.unshift(newBookmark);
  return newBookmark;
}

export async function removeBookmark(
  userId: string,
  scholarshipId: string
): Promise<boolean> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('scholarship_id', scholarshipId);
    if (error) {
      throw new Error(`Database error removing bookmark: ${error.message}`);
    }
    return true;
  }

  const initial = globalStore.bookmarks.length;
  globalStore.bookmarks = globalStore.bookmarks.filter(
    (b) => !(b.user_id === userId && b.scholarship_id === scholarshipId)
  );
  return globalStore.bookmarks.length < initial;
}

export async function isBookmarked(
  userId: string,
  scholarshipId: string
): Promise<boolean> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    try {
      const { count, error } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('scholarship_id', scholarshipId);

      if (!error && typeof count === 'number') {
        return count > 0;
      }
    } catch {
      // Fallback
    }
  }

  return globalStore.bookmarks.some(
    (b) => b.user_id === userId && b.scholarship_id === scholarshipId
  );
}

// ==============================================================================
// PROFILES REPOSITORY
// ==============================================================================

export async function getProfiles(): Promise<Profile[]> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) return data as Profile[];
    } catch {
      // Fallback
    }
  }

  return [...globalStore.profiles];
}

export async function getProfile(userId: string): Promise<Profile | null> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) return data as Profile;
    } catch {
      // Fallback
    }
  }

  return globalStore.profiles.find((p) => p.id === userId) || null;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  assertProductionConfig();
  const supabase = createClient();
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', userId)
      .select()
      .single();
    if (error) {
      throw new Error(`Database error updating profile: ${error.message}`);
    }
    if (data) return data as Profile;
  }

  const idx = globalStore.profiles.findIndex((p) => p.id === userId);
  if (idx === -1) return null;
  globalStore.profiles[idx] = {
    ...globalStore.profiles[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return globalStore.profiles[idx];
}
