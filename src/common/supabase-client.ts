// src/common/supabase-client.ts
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

// This is a factory function to create the Supabase client
export const createSupabaseClient = (configService: ConfigService) => {
  const supabaseUrl = configService.get<string>('SUPABASE_URL');
  const supabaseKey = configService.get<string>('SUPABASE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase URL and key must be defined in environment variables',
    );
  }

  return createClient(supabaseUrl, supabaseKey);
};
