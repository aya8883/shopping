/// <reference types="vite/client" />

declare module '*.json' {
  const value: Record<string, unknown>;
  export default value;
}

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_NAME_AR: string;
  readonly VITE_APP_SLOGAN: string;
  readonly VITE_APP_SLOGAN_AR: string;
  readonly VITE_HASURA_GRAPHQL_URL: string;
  readonly VITE_SUPERTOKENS_API_DOMAIN: string;
  readonly VITE_WEBSITE_DOMAIN: string;
  readonly VITE_DEFAULT_CITY: string;
  readonly VITE_DEFAULT_COUNTRY: string;
  readonly VITE_DEFAULT_CURRENCY: string;
  readonly VITE_DEFAULT_TIMEZONE: string;
  readonly VITE_DEFAULT_LOCALE: string;
  readonly VITE_USE_MOCK_DATA: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
