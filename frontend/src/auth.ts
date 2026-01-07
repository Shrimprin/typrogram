import axios from 'axios';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import axiosCaseConverter from 'simple-axios-case-converter';

import { setToast } from './actions/toast';

declare module 'next-auth' {
  interface User {
    accessToken: string;
    tokenExpiresAt: number;
    userId: number;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  basePath: '/api/auth',
  callbacks: {
    async authorized({ request, auth }) {
      const { pathname } = request.nextUrl;

      if (pathname.startsWith('/repositories') && !auth) {
        await setToast({ message: 'Please sign in.', type: 'warning' });
        return Response.redirect(new URL('/', request.nextUrl));
      }

      if (pathname === '/' && auth) {
        return Response.redirect(new URL('/repositories', request.nextUrl));
      }

      return true;
    },
    async signIn({ user, account, profile }) {
      const name = profile?.name || profile?.login;
      const githubId = account?.providerAccountId;
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`;
      const params = { name, githubId };
      try {
        axiosCaseConverter(axios);
        const response = await axios.post(url, params);
        if (response.status === 200) {
          user.accessToken = response.data.accessToken;
          user.tokenExpiresAt = response.data.expiresAt;
          user.userId = response.data.userId;
          return true;
        } else {
          return false;
        }
      } catch {
        await setToast({ message: 'Failed to sign in.', type: 'error' });
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.accessToken) {
        token.accessToken = user.accessToken;
      }
      if (user?.tokenExpiresAt) {
        token.tokenExpiresAt = user.tokenExpiresAt;
      }
      if (user?.userId) {
        token.userId = user.userId;
      }

      if (token.tokenExpiresAt && Math.floor(Date.now() / 1000) > (token.tokenExpiresAt as number)) {
        return null;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.user.accessToken = token.accessToken as string;
      }
      if (token.userId) {
        session.user.userId = token.userId as number;
      }
      session.expires = new Date((token.tokenExpiresAt as number) * 1000).toISOString() as string & Date;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/repositories`;
    },
  },
});
