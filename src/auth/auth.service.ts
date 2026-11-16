import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { LoginRequestDto } from './dto/request.dto.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';
import { User } from '../user/schemas/user.schema.js';
import { UserRepository } from '../user/repositories/user.repository.js';
import { PasswordHasher } from '@nestjs/authentication';
import { AppConfigService } from '../config/config.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken } from '../user/schemas/refresh-token.schema.js';
import { Model } from 'mongoose';
import { createHash, timingSafeEqual } from 'crypto';

type ReturnUser = Omit<User, 'passwordHash' | 'balance'>;
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly appConfigService: AppConfigService,
    private readonly jwtService: JwtService,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenRepo: Model<RefreshToken>,
  ) {}
  async register(registerRequestDto: CreateUserDto): Promise<{
    user: ReturnUser;
    token: string;
  }> {
    const existUser = await this.userRepository.findByEmail(
      registerRequestDto.email,
    );
    if (existUser)
      throw new BadRequestException(
        'Email đã được sử dụng. Vui lòng đổi email khác.',
      );
    const user = await this.userRepository.create({
      ...registerRequestDto,
      passwordHash: await this.passwordHasher.hash(registerRequestDto.password),
    });
    return {
      user: user,
      token: 'valid',
    };
  }

  async login(loginDto: LoginRequestDto): Promise<{
    user: ReturnUser;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const found = await this.userRepository.findCredentials(loginDto.email);
    // With no account (or no password), verify() checks a dummy hash, so the
    // response time does not reveal which emails are registered.
    const valid = await this.passwordHasher.verify(
      loginDto.password,
      found?.passwordHash,
    );
    if (!valid || !found?.passwordHash) {
      throw new BadRequestException('Sai mật khẩu hoặc email không tồn tại.');
    }
    // The cost settings changed since this hash was stored: upgrade it now,
    // while we have the plaintext.
    if (this.passwordHasher.needsRehash(found.passwordHash)) {
      await this.userRepository.updatePasswordHash(
        found.user.id,
        await this.passwordHasher.hash(loginDto.password),
      );
    }
    const tokens = await this.signTokens(found.user.id, found.user.email);
    await this.saveRefreshHash(found.user.id, tokens.refreshToken);
    return {
      user: found.user,
      tokens,
    };
  }

  async refresh(
    userId: string,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshHash = await this.refreshTokenRepo
      .findOne({ userId, revoked: false })
      .lean()
      .exec();
    const user = await this.userRepository.findById(userId);

    if (!refreshHash || !user) {
      throw new ForbiddenException(
        'Không thể truy cập, vui lòng đăng nhập lại',
      );
    }

    const valid = await this.isSameHash(refreshToken, refreshHash.refreshHash);
    if (!valid) {
      await this.refreshTokenRepo.updateMany({ userId }, { revoked: true });
      // Token không khớp => có thể bị dùng lại/bị đánh cắp: thu hồi toàn bộ
      throw new ForbiddenException(
        'Không thể truy cập, vui lòng đăng nhập lại',
      );
    }

    await this.refreshTokenRepo.findByIdAndUpdate(
      refreshHash._id,
      { revoked: true },
      { new: true },
    );

    // Issue cặp token mới
    const tokens = await this.signTokens(userId, user.email);
    await this.saveRefreshHash(userId, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.refreshTokenRepo.findOneAndUpdate(
      { userId },
      { revoked: true },
      { new: true },
    );
  }

  private async signTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.appConfigService.jwt().access.secret,
        expiresIn: this.appConfigService.jwt().access.expiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.appConfigService.jwt().refresh.secret,
        expiresIn: this.appConfigService.jwt().refresh.expiresIn,
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private async saveRefreshHash(userId: string, refreshToken: string) {
    const hash = await this.hashToken(refreshToken);
    const createdRefreshToken = new this.refreshTokenRepo({
      userId,
      refreshHash: hash,
      revoked: false,
    });
    (await createdRefreshToken.save()).toObject();
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private isSameHash(token: string, storedHash: string) {
    const a = Buffer.from(this.hashToken(token));
    const b = Buffer.from(storedHash);
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
