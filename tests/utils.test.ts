import { describe, expect, it, jest } from '@jest/globals';
import { getOrSetCache } from '../src/api/utils.js';

describe('Cache Utils', () => {
  it('should fetch from L1 memory cache if available', async () => {
    const fetchFn = jest.fn<() => Promise<any>>().mockResolvedValue('data');
    const mockRedis = { get: jest.fn(), set: jest.fn() };

    // First call sets it
    await getOrSetCache('test_key', fetchFn, mockRedis);

    // Second call should fetch from L1
    const fetchFn2 = jest.fn<() => Promise<any>>();
    const result = await getOrSetCache('test_key', fetchFn2, mockRedis);

    expect(result).toEqual('data');
    expect(fetchFn2).not.toHaveBeenCalled();
  });
});
