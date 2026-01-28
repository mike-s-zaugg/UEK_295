import * as supertest from 'supertest';
import { createE2EApp } from '../utils/e2e-app';
import { resetDatabase } from '../utils/db-reset';
import { ReturnUserDto, TokenInfoDto } from '../../src/modules/auth/dto';
import { UserSeedService } from '../../src/modules/auth/seed/user-seed.service';

describe('E2E - User flow', () => {
  let ctx: Awaited<ReturnType<typeof createE2EApp>>;
  let api: ReturnType<typeof supertest>;

  beforeAll(async () => {
    ctx = await createE2EApp();
    api = supertest(ctx.httpServer);
  });

  beforeEach(async () => {
    await resetDatabase(ctx.dataSource);
    // ✅ Seeds explizit und awaited
    await Promise.all([ctx.app.get(UserSeedService).seed()]);
  });

  afterAll(async () => {
    await ctx?.app?.close();
  });

  it('register -> duplicate -> login -> profile -> delete scenarios', async () => {
    // 1) create user
    const reg1 = await api.post('/auth/register').send({
      username: 'user1234',
      email: 'user1234@local.ch',
      password: 'user1234A$',
    });

    expect(reg1.status).toBe(201);
    const createdUserId = (reg1.body as ReturnUserDto).id;
    expect(createdUserId).toBeDefined();

    // 2) create again -> 409
    const reg2 = await api.post('/auth/register').send({
      username: 'user1234',
      email: 'user1234@local.ch',
      password: 'user1234A$',
    });

    expect(reg2.status).toBe(409);

    // 3) login created user
    const loginCreated = await api
      .post('/auth/login')
      .send({ username: 'user1234', password: 'user1234A$' });

    expect(loginCreated.status).toBe(201);
    const createdToken = (loginCreated.body as TokenInfoDto).access_token;

    // 4) profile created user
    const prof = await api
      .get('/auth/profile')
      .set('Authorization', `Bearer ${createdToken}`);

    expect(prof.status).toBe(200);
    expect((prof.body as ReturnUserDto).username).toBe('user1234');

    // 7) delete unauthorized -> 401
    const delUnauthorized = await api.delete(`/user/${createdUserId}`);
    expect(delUnauthorized.status).toBe(401);

    // 8) delete as normal user -> 403
    const loginUser = await api
      .post('/auth/login')
      .send({ username: 'user', password: 'user' });

    const delForbidden = await api
      .delete(`/user/${createdUserId}`)
      .set(
        'Authorization',
        `Bearer ${(loginUser.body as TokenInfoDto).access_token}`,
      );

    expect(delForbidden.status).toBe(403);

    // 9) delete as admin -> 200
    const loginAdmin = await api
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' });

    const delOk = await api
      .delete(`/user/${createdUserId}`)
      .set(
        'Authorization',
        `Bearer ${(loginAdmin.body as TokenInfoDto).access_token}`,
      );

    expect(delOk.status).toBe(200);
    expect((delOk.body as ReturnUserDto).username).toBe('user1234');
  });
});
