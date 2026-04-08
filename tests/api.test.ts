import { describe, expect, it, jest, beforeEach, beforeAll } from '@jest/globals';
import request from 'supertest';

// Mock shared services to avoid external dependencies in tests
const mockFindMany = jest.fn();
const mockCreate = jest.fn();

jest.unstable_mockModule('../src/shared/prisma.js', () => ({
  prisma: {
    user: {
      findMany: mockFindMany,
      create: mockCreate,
    },
  },
}));

const mockGet = jest.fn();
const mockSet = jest.fn();
const mockDel = jest.fn();
const mockConnectRedis = jest.fn();

jest.unstable_mockModule('../src/shared/redis.js', () => ({
  redisClient: {
    get: mockGet,
    set: mockSet,
    del: mockDel,
  },
  connectRedis: mockConnectRedis,
}));

const mockPublish = jest.fn();
const mockConnectRabbitMQ = jest.fn();

jest.unstable_mockModule('../src/shared/rabbitmq.js', () => ({
  publishUserCreatedEvent: mockPublish,
  connectRabbitMQ: mockConnectRabbitMQ,
}));

let app: any;

beforeAll(async () => {
    const serverModule = await import('../src/api/server.js');
    app = serverModule.app;
});

describe('REST API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/users should return empty users list if DB is empty', async () => {
    mockFindMany.mockResolvedValue([] as never);
    mockGet.mockResolvedValue(null as never); // No cache

    const res = await request(app).get('/api/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/users should create a user', async () => {
    const mockUser = { id: 1, email: 'test@test.com', name: 'Test' };
    mockCreate.mockResolvedValue(mockUser as never);

    const res = await request(app)
      .post('/api/users')
      .send({ email: 'test@test.com', name: 'Test' });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual(mockUser);
    expect(mockCreate).toHaveBeenCalled();
  });
});
