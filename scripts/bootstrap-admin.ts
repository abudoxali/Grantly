/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

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
          // Remove surrounding quotes if any
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

async function bootstrapAdmin() {
  console.log('--- Grantly Admin Bootstrap ---');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.');
    console.error('Please configure these in your .env.local or environment.');
    process.exit(1);
  }

  if (!adminEmail || !adminPassword) {
    console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be configured.');
    console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD in your .env.local or environment variables.');
    process.exit(1);
  }

  if (adminPassword.length < 8) {
    console.error('Error: ADMIN_PASSWORD must be at least 8 characters long.');
    process.exit(1);
  }

  console.log(`Target Admin Email: ${adminEmail}`);
  console.log(`Connecting to Supabase at: ${supabaseUrl}`);

  // Create admin client with service_role key (server-side only)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    let userId: string | null = null;

    // 1. Check if user already exists
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('Failed to list existing users:', listError.message);
      process.exit(1);
    }

    const existingUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === adminEmail.toLowerCase()
    );

    if (existingUser) {
      userId = existingUser.id;
      console.log(`Existing user found with ID: ${userId}`);

      // Update password and ensure email is confirmed
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          ...existingUser.user_metadata,
          role: 'admin',
          full_name: existingUser.user_metadata?.full_name || 'Grantly Administrator',
        },
      });

      if (updateError) {
        console.error('Failed to update admin credentials:', updateError.message);
        process.exit(1);
      }
      console.log('✓ Updated password and confirmed email for existing account.');
    } else {
      // 2. Create new admin user
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Grantly Administrator',
          role: 'admin',
        },
      });

      if (createError || !createData.user) {
        console.error('Failed to create admin user:', createError?.message);
        process.exit(1);
      }

      userId = createData.user.id;
      console.log(`✓ Created new admin user with ID: ${userId}`);
    }

    // 3. Ensure profiles table has role = 'admin'
    const { error: profileError } = await (supabaseAdmin as any)
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: adminEmail,
          full_name: 'Grantly Administrator',
          role: 'admin',
          preferred_language: 'en',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.error('Failed to set role in profiles table:', profileError.message);
      process.exit(1);
    }

    console.log(`✓ Profile row confirmed with role = 'admin'.`);
    console.log(`✓ Admin bootstrap complete for: ${adminEmail}`);
    console.log('The administrator can now log in at /admin/login.');
  } catch (err: unknown) {
    console.error('Unexpected error during bootstrap:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

bootstrapAdmin();
