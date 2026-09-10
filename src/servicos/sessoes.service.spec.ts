import { describe, expect, it, vi } from 'vitest';
import { SessoesService } from './sessoes.service.js';

describe('SessoesService', () => {
  it('revoga todas as sessões pertencentes ao usuário', async () => {
    const query = vi.fn().mockResolvedValue([]);
    const service = new SessoesService({ query } as any);

    await service.revogarDoUsuario('usuario-123');

    expect(query).toHaveBeenCalledOnce();
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("sess -> 'usuario' ->> 'id' = $1"),
      ['usuario-123'],
    );
  });
});
