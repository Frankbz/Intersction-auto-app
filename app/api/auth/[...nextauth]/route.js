import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
        email: { label: "Email", type: "email" }
      },
      async authorize(credentials) {
        // check if email and password is empty
        if (!credentials.email || !credentials.password) {
          return null;
        }

        // check existence of user
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });
        if (!user) {
          return null;
        }

        // check if password is correct
        const match = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!match) {
          return null;
        }

        // return user if all checks passed
        return user;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    session:({session, token}) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      }
    })
      

  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };