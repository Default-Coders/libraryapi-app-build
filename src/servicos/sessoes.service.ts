import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SessoesService {
  constructor(private readonly banco: DataSource) {}

  async revogarDoUsuario(usuarioId: string) {
    await this.banco.query(
      `DELETE FROM tb_session WHERE sess -> 'usuario' ->> 'id' = $1`,
      [usuarioId],
    );
  }
}
