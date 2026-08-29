export const appConfig = {
  name: import.meta.env.VITE_APP_NAME ?? 'Wain Awfar',
  nameAr: import.meta.env.VITE_APP_NAME_AR ?? 'وين أوفر؟',
  slogan: import.meta.env.VITE_APP_SLOGAN ?? 'Compare. Save. Shop smarter.',
  sloganAr: import.meta.env.VITE_APP_SLOGAN_AR ?? 'قارن. وفر. تسوق بذكاء.',
  hasuraGraphqlUrl:
    import.meta.env.VITE_HASURA_GRAPHQL_URL ?? 'http://localhost:8080/v1/graphql',
  superTokensApiDomain:
    import.meta.env.VITE_SUPERTOKENS_API_DOMAIN ?? 'http://localhost:3001',
  websiteDomain: import.meta.env.VITE_WEBSITE_DOMAIN ?? 'http://localhost:5173',
  defaultCity: import.meta.env.VITE_DEFAULT_CITY ?? 'Riyadh',
  defaultCountry: import.meta.env.VITE_DEFAULT_COUNTRY ?? 'SA',
  defaultCurrency: import.meta.env.VITE_DEFAULT_CURRENCY ?? 'SAR',
  defaultTimezone: import.meta.env.VITE_DEFAULT_TIMEZONE ?? 'Asia/Riyadh',
  defaultLocale: (import.meta.env.VITE_DEFAULT_LOCALE as 'ar' | 'en') ?? 'ar',
};

export type AppLocale = 'ar' | 'en';
