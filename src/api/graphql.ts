import { prisma } from '../shared/prisma.js';
import { redisClient } from '../shared/redis.js';
import { publishUserCreatedEvent } from '../shared/rabbitmq.js';

export const typeDefs = `#graphql
  type User {
    id: Int!
    email: String!
    name: String
    createdAt: String!
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
  }

  type Mutation {
    createUser(email: String!, name: String): User!
  }
`;

export const resolvers = {
  Query: {
    users: async () => {
      // Trying Redis first
      const cached = await redisClient.get('graphql_users');
      if (cached) return JSON.parse(cached);

      const users = await prisma.user.findMany();
      await redisClient.set('graphql_users', JSON.stringify(users), { EX: 60 });
      return users;
    },
    user: async (_: any, { id }: { id: number }) => {
      return await prisma.user.findUnique({ where: { id } });
    },
  },
  Mutation: {
    createUser: async (_: any, { email, name }: { email: string; name?: string }) => {
      const user = await prisma.user.create({
        data: { email, name },
      });
      publishUserCreatedEvent(user.id, user.email);
      // Invalidate cache
      await redisClient.del('graphql_users');
      return user;
    },
  },
};
