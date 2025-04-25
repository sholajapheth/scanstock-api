import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
import { OtpService } from './services/otp.service';
import {
  RequestResetPasswordDto,
  ResetPasswordDto,
} from './dto/reset-password.dto';
import { RequestOtpDto, ValidateOtpDto } from './dto/otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Check if email is already in use
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(createUserDto.password);

    // Create new user
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Generate verification OTP
    const verificationOtp = this.otpService.generateOtp();
    this.otpService.storeOtp(newUser.email, verificationOtp);

    // Send verification email
    await this.emailService.sendVerificationEmail(
      newUser.email,
      `${newUser.firstName} ${newUser.lastName}`,
      verificationOtp,
    );

    // Send welcome email
    await this.emailService.sendWelcomeEmail(
      newUser.email,
      `${newUser.firstName} ${newUser.lastName}`,
    );

    return {
      message:
        'User registered successfully. Please check your email to verify your account.',
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    };
  }

  async verifyEmail(validateOtpDto: ValidateOtpDto) {
    const { email, otp } = validateOtpDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const isValid = this.otpService.validateOtp(email, otp);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Update user's email verification status
    await this.usersService.updateEmailVerification(user.id.toString(), true);

    return {
      message: 'Email verified successfully',
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification OTP
    const verificationOtp = this.otpService.generateOtp();
    this.otpService.storeOtp(email, verificationOtp);

    // Send verification email
    await this.emailService.sendVerificationEmail(
      email,
      `${user.firstName} ${user.lastName}`,
      verificationOtp,
    );

    return {
      message: 'Verification email sent successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);
    console.log('user', user);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // // Check if email is verified
    // if (!user.isEmailVerified) {
    //   throw new UnauthorizedException(
    //     'Please verify your email before logging in',
    //   );
    // }

    // Verify password
    const isPasswordValid = await this.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        businessName: user.business,
      },
      access_token: accessToken,
    };
  }

  async requestPasswordReset(requestResetDto: RequestResetPasswordDto) {
    const { email } = requestResetDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate OTP
    const otp = this.otpService.generateOtp();
    this.otpService.storeOtp(email, otp);

    // Send reset password email
    // In development environment, send to developer email, otherwise send to user's email
    const emailTo =
      process.env.NODE_ENV === 'development'
        ? 'sholajapheth@gmail.com'
        : user.email;

    await this.emailService.sendPasswordResetEmail(
      emailTo,
      `${user.firstName} ${user.lastName}`,
      otp,
    );

    return {
      message: 'Password reset instructions have been sent to your email',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, otp, newPassword } = resetPasswordDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate OTP
    const isValidOtp = this.otpService.validateOtp(email, otp);
    if (!isValidOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password
    await this.usersService.updatePassword(user.id, hashedPassword);

    return {
      message: 'Password has been successfully reset',
    };
  }

  async requestOtp(requestOtpDto: RequestOtpDto) {
    const { email } = requestOtpDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate OTP
    const otp = this.otpService.generateOtp();
    this.otpService.storeOtp(email, otp);

    // Send OTP email
    await this.emailService.sendOtpEmail(
      'sholajapheth@gmail.com',
      `${user.firstName} ${user.lastName}`,
      otp,
    );

    return {
      message: 'OTP has been sent to your email',
    };
  }

  async validateOtp(validateOtpDto: ValidateOtpDto) {
    const { email } = validateOtpDto;

    // Just check if a valid OTP exists
    const storedData = this.otpService.getStoredOtp(email);
    if (!storedData) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return {
      message: 'OTP is valid',
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  private async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
