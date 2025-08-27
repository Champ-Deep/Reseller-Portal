/**
 * WARNING: This file connects this app to Create's internal auth system. Do
 * not attempt to edit it. Do not import @auth/create or @auth/create
 * anywhere else or it may break. This is an internal package.
 */
import CreateAuth from "@auth/create"
import Credentials from "@auth/core/providers/credentials"

export const { auth } = CreateAuth({
  providers: [Credentials({
    credentials: {
      email: {
        label: 'Email',
        type: 'email',
      },
      password: {
        label: 'Password',
        type: 'password',
      },
    },
    async authorize(credentials) {
      // For development, accept any credentials
      if (credentials?.email && credentials?.password) {
        return {
          id: '1',
          email: credentials.email,
          name: credentials.email.split('@')[0] || 'Demo User',
        };
      }
      return null;
    },
  })],
  pages: {
    signIn: '/account/signin',
    signOut: '/account/logout',
  },
})