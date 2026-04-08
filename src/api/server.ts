import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { prisma } from '../shared/prisma.js';
import { connectRedis, redisClient } from '../shared/redis.js';
import { connectRabbitMQ, publishUserCreatedEvent } from '../shared/rabbitmq.js';
import { typeDefs, resolvers } from './graphql.js';
import { getOrSetCache, runHeavyComputation } from './utils.js';

export const app = express();

app.use(cors());
app.use(express.json());

// REST API Endpoints
app.get('/api/users', async (req, res) => {
    try {
        const users = await getOrSetCache('rest_users', () => prisma.user.findMany(), redisClient);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { email, name } = req.body;
        const user = await prisma.user.create({ data: { email, name } });
        publishUserCreatedEvent(user.id, user.email);
        await redisClient.del('rest_users');
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user' });
    }
});

// Advanced Node.js feature showcase: Worker threads + Native Fetch
app.get('/api/external-data-computation', async (req, res) => {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const users = await response.json();
        const result = await runHeavyComputation(users);
        res.json({ success: true, computationalResult: result, userCount: users.length });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
});

export const setupServer = async () => {
    await connectRedis();
    await connectRabbitMQ();

    const apolloServer = new ApolloServer({ typeDefs, resolvers });
    await apolloServer.start();

    app.use('/graphql', expressMiddleware(apolloServer));

    return app;
};
