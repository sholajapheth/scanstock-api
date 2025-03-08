// src/services/SupabaseStorageService.ts
import { createClient } from '@supabase/supabase-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseStorageService {
  private supabase;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    // Initialize Supabase client with your project URL and key
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    // The bucket name where profile pictures will be stored
    this.bucketName =
      this.configService.get<string>('SUPABASE_BUCKET') || 'profiles';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured properly');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Upload a file to Supabase storage
   * @param file The file buffer to upload
   * @param fileName The name to give the file in storage
   * @param contentType The MIME type of the file
   * @returns Promise resolving to the URL of the uploaded file
   */
  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<string> {
    // Convert the file name to be URL-safe
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Create a unique file path to avoid collisions
    const timestamp = Date.now();
    const filePath = `${timestamp}_${safeName}`;

    // Upload to Supabase storage
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Error uploading file to Supabase: ${error.message}`);
    }

    // Get the public URL for the file
    const { data: urlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  /**
   * Delete a file from Supabase storage
   * @param fileUrl The public URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    // Extract the file path from the URL
    const urlObj = new URL(fileUrl);
    const pathParts = urlObj.pathname.split('/');
    const filePath = pathParts[pathParts.length - 1];

    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Error deleting file from Supabase: ${error.message}`);
    }
  }
}
