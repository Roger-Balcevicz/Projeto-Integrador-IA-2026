import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../interfaces/auth.interface';

// Utilizado implicitamente por JwtAuthGuard, o parâmetro 'jwt' no extends sinaliza que deve ser usada essa classe
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  override validate(payload: JwtPayload) {
    return { userId: payload.sub, name: payload.name, phone: payload.phone };
  }
}
