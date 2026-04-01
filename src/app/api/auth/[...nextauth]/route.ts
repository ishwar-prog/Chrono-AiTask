import NextAuth, { type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("Auth: Missing email or password");
            return null;
          }

          await connectToDatabase();

          const email = credentials.email.toLowerCase().trim();
          console.log(`Auth: Attempting login for ${email}`);

          const user = await User.findOne({ email }).select("+password");

          if (!user) {
            console.error(`Auth: No user found for ${email}`);
            return null;
          }

          if (!user.password) {
            console.error(`Auth: Password field missing for ${email} — check schema select: false`);
            return null;
          }

          const isMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isMatch) {
            console.error(`Auth: Incorrect password for ${email}`);
            return null;
          }

          console.log(`Auth: Login successful for ${email}`);
          return { id: user._id.toString(), email: user.email, name: user.name };
        } catch (err: unknown) {
          console.error("Auth: Unexpected error in authorize:", (err as Error).message);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: { id?: string; name?: string | null } }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as Session["user"] & { id: string }).id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
