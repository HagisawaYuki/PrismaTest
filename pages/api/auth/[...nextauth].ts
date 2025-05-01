import { NextApiHandler } from 'next';
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import prisma from '../../../lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Console } from 'console';
// import { compare } from 'bcryptjs';

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;

const options = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password required');
        }
        console.log("AAAAA")
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true
          },
        });
        console.log(user.email)
        if (!user || !user.password) {
          console.log("BBBBB")
          throw new Error('No user found or password not set');
        }

        // const isValid = await compare(credentials.password, user.password);
        console.log(credentials.password);
        console.log(user.password);
        
        const isValid = credentials.password === user.password;
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.SECRET,
};
