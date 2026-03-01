import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcryptjs from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { property: true },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }

        const isMatch = await bcryptjs.compare(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role, user.propertyId);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                property: {
                    id: user.property.id,
                    name: user.property.name,
                    logo: user.property.logo,
                },
            },
            ...tokens,
        };
    }

    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existing) {
            throw new UnauthorizedException('Email đã được sử dụng');
        }

        const passwordHash = await bcryptjs.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash,
                propertyId: dto.propertyId,
                role: 'RECEPTIONIST',
            },
        });

        const tokens = await this.generateTokens(user.id, user.email, user.role, user.propertyId);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            ...tokens,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user || !user.isActive) {
                throw new UnauthorizedException('Token không hợp lệ');
            }

            const tokens = await this.generateTokens(user.id, user.email, user.role, user.propertyId);
            return tokens;
        } catch {
            throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
        }
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { property: true },
        });

        if (!user) {
            throw new UnauthorizedException('Người dùng không tồn tại');
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            property: {
                id: user.property.id,
                name: user.property.name,
                logo: user.property.logo,
            },
        };
    }

    private async generateTokens(userId: string, email: string, role: string, propertyId: string) {
        const payload = { sub: userId, email, role, propertyId };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
            }),
        ]);

        return { accessToken, refreshToken };
    }
}
