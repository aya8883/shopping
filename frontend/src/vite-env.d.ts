/// <reference types="vite/client" />

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
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
