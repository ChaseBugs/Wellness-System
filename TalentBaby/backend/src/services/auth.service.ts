import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRepository, User } from '../repositories/user.repository';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async signup(email: string, password: string, fullName?: string): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      const error: AppError = new Error('User with this email already exists');
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.userRepository.create({
      email,
      password_hash,
      full_name: fullName,
    });

    // Create default notification preferences
    await this.userRepository.createNotificationPreferences(user.id);

    // Generate JWT token
    const token = this.generateToken(user.id);

    // Remove password hash from response
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token,
    };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      const error: AppError = new Error('Invalid email or password');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      const error: AppError = new Error('Invalid email or password');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    // Generate JWT token
    const token = this.generateToken(user.id);

    // Remove password hash from response
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token,
    };
  }

  private generateToken(userId: number): string {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    return jwt.sign({ userId }, jwtSecret as string, { expiresIn: jwtExpiresIn } as SignOptions);
  }
}
