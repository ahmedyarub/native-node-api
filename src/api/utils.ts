import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';

// A simple in-memory cache layer as an L1 cache
const inMemoryCache = new Map<string, any>();

export const getOrSetCache = async (key: string, fetchFn: () => Promise<any>, redisClient: any) => {
    // 1. Check L1 in-memory cache
    if (inMemoryCache.has(key)) {
        return inMemoryCache.get(key);
    }

    // 2. Check L2 Redis cache
    if (redisClient) {
        const cached = await redisClient.get(key);
        if (cached) {
            const parsed = JSON.parse(cached);
            inMemoryCache.set(key, parsed);
            return parsed;
        }
    }

    // 3. Fetch data
    const data = await fetchFn();

    // Set caches
    inMemoryCache.set(key, data);
    if (redisClient) {
        await redisClient.set(key, JSON.stringify(data), {
            EX: 60 // 1 minute expiration
        });
    }

    return data;
};

export const runHeavyComputation = (data: any[]): Promise<number> => {
    return new Promise((resolve, reject) => {
        const ext = process.env.NODE_ENV === 'production' ? '.js' : '.ts';
        const workerPath = fileURLToPath(new URL(`./computation-worker${ext}`, import.meta.url));
        const worker = new Worker(workerPath, { workerData: data });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
};
