import { betterAuth } from "better-auth";
import { PostgresJSDialect } from "kysely-postgres-js";
import { client } from "./db";

export const auth = process.env.NODE_ENV === "test"
  ? { api: { getSession: async () => null }, handler: () => {} } as any
  : betterAuth({
  database: new PostgresJSDialect({
    postgres: client,
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
