import express from 'express';
import cors from 'cors';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session/index.js';
import EmailPassword from 'supertokens-node/recipe/emailpassword/index.js';
import { middleware, errorHandler } from 'supertokens-node/framework/express/index.js';
import { Pool } from 'pg';

const port = Number(process.env.PORT ?? 3001);
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
const connectionURI = process.env.SUPERTOKENS_CONNECTION_URI ?? 'http://localhost:3567';
const apiDomain = process.env.API_DOMAIN ?? 'http://localhost:3001';
const websiteDomain = process.env.WEBSITE_DOMAIN ?? 'http://localhost:5173';
const appName = process.env.SUPERTOKENS_APP_NAME ?? 'Wain Awfar';
const databaseUrl =
  process.env.DATABASE_URL ??
  'postgres://wain_awfar:wain_awfar_dev_password@localhost:5432/wain_awfar';

const pool = new Pool({ connectionString: databaseUrl });

type AppRole = 'consumer' | 'reviewer' | 'admin';

async function ensureUserProfile(params: {
  supertokensUserId: string;
  email?: string;
  firstName?: string;
}): Promise<{ id: string; role: AppRole }> {
  const existing = await pool.query<{ id: string; role: AppRole }>(
    `SELECT id, role FROM user_profiles WHERE supertokens_user_id = $1 LIMIT 1`,
    [params.supertokensUserId],
  );
  if (existing.rows[0]) {
    return existing.rows[0];
  }

  const inserted = await pool.query<{ id: string; role: AppRole }>(
    `INSERT INTO user_profiles (supertokens_user_id, email, first_name, role, preferred_language, country, city)
     VALUES ($1, $2, $3, 'consumer', 'ar', 'SA', 'Riyadh')
     RETURNING id, role`,
    [params.supertokensUserId, params.email ?? null, params.firstName ?? null],
  );
  return inserted.rows[0];
}

function hasuraClaims(userId: string, role: AppRole) {
  const allowed: AppRole[] =
    role === 'admin'
      ? ['admin', 'reviewer', 'consumer']
      : role === 'reviewer'
        ? ['reviewer', 'consumer']
        : ['consumer'];

  return {
    'https://hasura.io/jwt/claims': {
      'x-hasura-default-role': role,
      'x-hasura-allowed-roles': allowed,
      'x-hasura-user-id': userId,
    },
  };
}

supertokens.init({
  framework: 'express',
  supertokens: {
    connectionURI,
    apiKey: process.env.SUPERTOKENS_API_KEY || undefined,
  },
  appInfo: {
    appName,
    apiDomain,
    websiteDomain,
    apiBasePath: '/auth',
    websiteBasePath: '/auth',
  },
  recipeList: [
    EmailPassword.init({
      signUpFeature: {
        formFields: [{ id: 'name', optional: true }],
      },
      override: {
        functions: (originalImplementation) => ({
          ...originalImplementation,
          signUp: async (input) => {
            const response = await originalImplementation.signUp(input);
            if (response.status === 'OK') {
              await ensureUserProfile({
                supertokensUserId: response.user.id,
                email: response.user.emails[0],
              });
            }
            return response;
          },
          signIn: async (input) => {
            const response = await originalImplementation.signIn(input);
            if (response.status === 'OK') {
              await ensureUserProfile({
                supertokensUserId: response.user.id,
                email: response.user.emails[0],
              });
            }
            return response;
          },
        }),
      },
    }),
    Session.init({
      exposeAccessTokenToFrontendInCookieBasedAuth: true,
      override: {
        functions: (originalImplementation) => ({
          ...originalImplementation,
          createNewSession: async (input) => {
            const profile = await ensureUserProfile({
              supertokensUserId: input.userId,
            });
            input.accessTokenPayload = {
              ...input.accessTokenPayload,
              ...hasuraClaims(profile.id, profile.role),
            };
            return originalImplementation.createNewSession(input);
          },
        }),
      },
    }),
  ],
});

const app = express();

app.use(
  cors({
    origin: corsOrigin,
    allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
    credentials: true,
  }),
);

app.use(middleware());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'auth-service' });
});

app.use(errorHandler());

app.listen(port, () => {
  console.log(`Auth service listening on ${port}`);
});
