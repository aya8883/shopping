import SuperTokens from 'supertokens-auth-react';
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword';
import Session from 'supertokens-auth-react/recipe/session';
import { appConfig } from '../config/app';

let initialized = false;

export function initSuperTokens(): void {
  if (initialized) return;
  initialized = true;

  const siteBase = import.meta.env.BASE_URL.replace(/\/$/, '');

  SuperTokens.init({
    appInfo: {
      appName: appConfig.name,
      apiDomain: appConfig.superTokensApiDomain,
      websiteDomain: appConfig.websiteDomain,
      apiBasePath: '/auth',
      websiteBasePath: `${siteBase}/auth`,
    },
    recipeList: [
      EmailPassword.init(),
      Session.init({
        tokenTransferMethod: 'header',
      }),
    ],
  });
}
