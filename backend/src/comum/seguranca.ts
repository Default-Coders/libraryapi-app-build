import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';

export const UsuarioAtual = createParamDecorator(
  (_dados: unknown, contexto: ExecutionContext) =>
    (contexto.switchToHttp().getRequest() as any).session?.usuario,
);

@Injectable()
export class Autenticado implements CanActivate {
  canActivate(contexto: ExecutionContext) {
    const usuario = (contexto.switchToHttp().getRequest() as any).session
      ?.usuario;
    if (!usuario)
      throw new UnauthorizedException('É necessário estar autenticado.');
    return true;
  }
}
@Injectable()
export class SomenteAdministrador implements CanActivate {
  canActivate(contexto: ExecutionContext) {
    const usuario = (contexto.switchToHttp().getRequest() as any).session
      ?.usuario;
    if (!usuario)
      throw new UnauthorizedException('É necessário estar autenticado.');
    if (usuario.perfil !== 'ROLE_ADMIN')
      throw new ForbiddenException(
        'Você não possui permissão para acessar este recurso.',
      );
    return true;
  }
}
@Injectable()
export class SomenteAluno implements CanActivate {
  canActivate(contexto: ExecutionContext) {
    const usuario = (contexto.switchToHttp().getRequest() as any).session
      ?.usuario;
    if (!usuario)
      throw new UnauthorizedException('É necessário estar autenticado.');
    if (usuario.perfil !== 'ROLE_STUDENT')
      throw new ForbiddenException(
        'Você não possui permissão para acessar este recurso.',
      );
    return true;
  }
}
