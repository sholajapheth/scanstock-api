import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  private otpStore: Map<string, { otp: string; expires: Date }> = new Map();
  private readonly OTP_EXPIRY_MINUTES = 15;

  constructor(private readonly configService: ConfigService) {}

  generateOtp(): string {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  storeOtp(email: string, otp: string): void {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + this.OTP_EXPIRY_MINUTES);
    this.otpStore.set(email, { otp, expires });
  }

  getStoredOtp(email: string): { otp: string; expires: Date } | null {
    const storedData = this.otpStore.get(email);
    if (!storedData) {
      return null;
    }

    // Check if OTP has expired
    if (new Date() > storedData.expires) {
      this.otpStore.delete(email);
      return null;
    }

    return storedData;
  }

  validateOtp(email: string, otp: string): boolean {
    const storedData = this.otpStore.get(email);

    if (!storedData) {
      return false;
    }

    const { otp: storedOtp, expires } = storedData;

    // Check if OTP has expired
    if (new Date() > expires) {
      this.otpStore.delete(email);
      return false;
    }

    // Check if OTP matches
    const isValid = storedOtp === otp;

    // Remove OTP after validation (one-time use)
    if (isValid) {
      this.otpStore.delete(email);
    }

    return isValid;
  }

  clearOtp(email: string): void {
    this.otpStore.delete(email);
  }
}
