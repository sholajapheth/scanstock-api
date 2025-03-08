// src/common/storage/storage.service.ts
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSupabaseClient } from '../supabase-client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createSupabaseClient(configService);
  }

  /**
   * Upload a file to a specific bucket in Supabase storage
   *
   * @param file The file buffer to upload
   * @param bucketName The name of the bucket to upload to
   * @param folder Optional folder path within the bucket
   * @param customFileName Custom file name (default: random UUID)
   * @param contentType Optional content type
   * @returns The public URL of the uploaded file
   */
  async uploadFile(
    file: Buffer,
    bucketName: string,
    folder: string = '',
    customFileName?: string,
    contentType?: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      // Create a unique file name if not provided
      const fileName = customFileName || `${uuidv4()}`;

      // Create the full path (with folder if provided)
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload the file to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          contentType: contentType || 'application/octet-stream',
          upsert: true, // Overwrite existing file if it exists
        });

      if (error) {
        throw new InternalServerErrorException(
          `Error uploading file: ${error.message}`,
        );
      }

      // Get the public URL for the file
      const { data: urlData } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to upload file: ${error.message}`,
      );
    }
  }

  /**
   * Delete a file from Supabase storage
   *
   * @param bucketName The name of the bucket
   * @param filePath The full path of the file to delete
   * @returns Boolean indicating success
   */
  async deleteFile(bucketName: string, filePath: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        throw new InternalServerErrorException(
          `Error deleting file: ${error.message}`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete file: ${error.message}`,
      );
    }
  }

  /**
   * Extract file path from a Supabase storage URL
   *
   * @param publicUrl The public URL of the file
   * @param bucketName The bucket name to match
   * @returns The file path relative to the bucket
   */
  extractPathFromUrl(publicUrl: string, bucketName: string): string | null {
    if (!publicUrl) return null;

    try {
      const url = new URL(publicUrl);
      const pathSegments = url.pathname.split('/');

      // Find the bucket name in the path and extract everything after it
      const bucketIndex = pathSegments.findIndex(
        (segment) => segment === bucketName,
      );
      if (bucketIndex === -1) return null;

      return pathSegments.slice(bucketIndex + 1).join('/');
    } catch (error) {
      return null;
    }
  }
}
