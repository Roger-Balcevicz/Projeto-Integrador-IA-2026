import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserDocument } from '../../user/user.schema';

// Utilizado implicitamente por LocalAuthGuard, o parâmetro 'local' no extends sinaliza que deve ser usada essa classe
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'phone' });
  }

  override async validate(
    phone: string,
    password: string,
  ): Promise<UserDocument> {
    const user = await this.authService.validateUser(phone, password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return user;
  }
}
