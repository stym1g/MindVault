import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from './schemas/user.schema';
import { LoginDto, RegisterDto } from './dto/auth.dto';
@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private users: Model<UserDocument>, private config: ConfigService) {}
  private token(user: UserDocument) {
    return jwt.sign({ sub: user.id, email: user.email }, this.config.get('JWT_SECRET') || 'dev-only-change-me', { expiresIn: this.config.get('JWT_EXPIRES_IN') || '7d' });
  }
  async register(dto: RegisterDto) {
    if (await this.users.exists({ email: dto.email.toLowerCase() })) throw new ConflictException('Email already registered');
    const user = await this.users.create({ email: dto.email, name: dto.name, passwordHash: await bcrypt.hash(dto.password, 12) });
    return { accessToken: this.token(user), user: { id: user.id, email: user.email, name: user.name } };
  }
  async login(dto: LoginDto) {
    const user = await this.users.findOne({ email: dto.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid email or password');
    return { accessToken: this.token(user), user: { id: user.id, email: user.email, name: user.name } };
  }
}
