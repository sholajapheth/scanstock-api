import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import {
  RequestResetPasswordDto,
  ResetPasswordDto,
} from './dto/reset-password.dto';
import { RequestOtpDto, ValidateOtpDto } from './dto/otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User has been successfully registered.',
    schema: {
      properties: {
        message: { type: 'string', example: 'User registered successfully' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'user@example.com' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already in use' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User has been successfully logged in.',
    schema: {
      properties: {
        message: { type: 'string', example: 'Login successful' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'user@example.com' },
            businessName: { type: 'string', example: 'My Store' },
          },
        },
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('password/reset-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: RequestResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset instructions sent.',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Password reset instructions have been sent to your email',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Not Found - User not found' })
  async requestPasswordReset(@Body() requestResetDto: RequestResetPasswordDto) {
    return this.authService.requestPasswordReset(requestResetDto);
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using OTP' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password has been reset.',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Password has been successfully reset',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid or expired OTP',
  })
  @ApiResponse({ status: 404, description: 'Not Found - User not found' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP' })
  @ApiBody({ type: RequestOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully.',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'OTP has been sent to your email',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Not Found - User not found' })
  async requestOtp(@Body() requestOtpDto: RequestOtpDto) {
    return this.authService.requestOtp(requestOtpDto);
  }

  @Post('otp/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate OTP' })
  @ApiBody({ type: ValidateOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP validated successfully.',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'OTP validated successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid or expired OTP',
  })
  async validateOtp(@Body() validateOtpDto: ValidateOtpDto) {
    return this.authService.validateOtp(validateOtpDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email' })
  @ApiBody({ type: ValidateOtpDto })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully.',
    schema: {
      properties: {
        message: { type: 'string', example: 'Email verified successfully' },
      },
    },
  })
  async verifyEmail(@Body() verifyEmailDto: ValidateOtpDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully.',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Verification email sent successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Email already verified',
  })
  @ApiResponse({ status: 404, description: 'Not Found - User not found' })
  async resendVerificationEmail(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }
}
