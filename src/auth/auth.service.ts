import { ForbiddenException, Injectable } from '@nestjs/common';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signin(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await argon.verify(user.password, dto.password))) {
      throw new ForbiddenException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id, user.email);

    await this.updateRefreshToken(user.id, refreshToken);

    return { data: { accessToken, refreshToken } };
  }

  async signup(dto: SignupDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          password: hash,
        },
      });

      const accessToken = this.generateAccessToken(user.id, user.email);
      const refreshToken = await this.generateRefreshToken(user.id, user.email); // await to get the hashed version

      await this.updateRefreshToken(user.id, refreshToken); // update with the hashed refresh token

      return { accessToken, refreshToken };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Email already exists');
      }
      throw error;
    }
  }

  async refreshTokens(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub, email: payload.email },
    });

    if (!user || user.hashedRefreshToken !== refreshToken) {
      throw new ForbiddenException('Invalid refresh token');
    }

    const accessToken = await this.generateAccessToken(user.id, user.email);
    const newRefreshToken = await this.generateRefreshToken(
      user.id,
      user.email,
    );

    await this.updateRefreshToken(user.id, newRefreshToken);

    return { data: { accessToken, refreshToken: newRefreshToken } };
  }

  private generateAccessToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    const secret = this.configService.get('JWT_SECRET');
    return this.jwtService.sign(payload, { expiresIn: '15m', secret });
  }

  private generateRefreshToken(userId: number, email: string): string {
    const secret = this.configService.get('JWT_SECRET');
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload, { expiresIn: '1y', secret });
  }

  private async verifyRefreshToken(token: string) {
    const secret = this.configService.get('JWT_SECRET');

    try {
      return await this.jwtService.verify(token, { secret });
    } catch (error) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }
  private async updateRefreshToken(userId: number, refreshToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: refreshToken },
    });
  }
}
