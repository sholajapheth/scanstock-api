import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SupabaseStorageService } from '../services/SupabaseStorageService';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the profile of the current authenticated user.',
  })
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      console.log('Updating user:', id, updateUserDto);

      // Parse ID to number
      const userId = parseInt(id, 10);
      if (isNaN(userId)) {
        throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
      }

      // Call service method with simple timeout
      const updatePromise = this.usersService.update(userId, updateUserDto);

      // Add timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Update operation timed out')), 5000);
      });

      // Race the promises
      const result = await Promise.race([updatePromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.error('Error updating user:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      if (error.message === 'Update operation timed out') {
        throw new HttpException(
          'Request timed out',
          HttpStatus.REQUEST_TIMEOUT,
        );
      }

      throw new HttpException(
        'Failed to update user profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      req.user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('profile-picture')
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The profile picture has been successfully uploaded.',
  })
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfilePicture(@Request() req, @UploadedFile() file) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Check file type - only accept images
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    // Check file size - limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds the 2MB limit');
    }

    const userId = req.user.id;

    try {
      // First, get the current user to check if they already have a profile picture
      const currentUser = await this.usersService.findById(userId);
      const previousImageUrl = currentUser.profilePicture;

      // Get file information for new upload
      const { buffer, originalname, mimetype } = file;

      // Upload new image to Supabase
      const imageUrl = await this.supabaseStorageService.uploadFile(
        buffer,
        originalname,
        mimetype,
      );

      // Update user profile with the new image URL
      await this.usersService.update(userId, { profilePicture: imageUrl });

      // If there was a previous image, delete it from storage
      if (previousImageUrl) {
        try {
          // Extract file path from URL
          const fileKey = this.extractFileKeyFromUrl(previousImageUrl);
          if (fileKey) {
            await this.supabaseStorageService.deleteFile(fileKey);
          }
        } catch (deleteError) {
          // Log the error but don't fail the request
          console.error(
            `Failed to delete previous profile picture: ${deleteError.message}`,
          );
        }
      }

      return { imageUrl };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload profile picture: ${error.message}`,
      );
    }
  }

  // Helper method to extract file key from Supabase URL
  private extractFileKeyFromUrl(url: string): string | null {
    try {
      // Supabase URLs typically follow this pattern:
      // https://[project].supabase.co/storage/v1/object/public/[bucket]/[filename]
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');

      // Find the part after 'public' which is usually the bucket and filename
      const publicIndex = pathParts.findIndex((part) => part === 'public');
      if (publicIndex !== -1 && publicIndex < pathParts.length - 1) {
        // Return everything after 'public' which is the bucket and filename
        return pathParts.slice(publicIndex + 1).join('/');
      }
      return null;
    } catch (error) {
      console.error(`Error extracting file key from URL: ${error.message}`);
      return null;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user account' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
