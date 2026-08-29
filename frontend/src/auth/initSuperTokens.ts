import SuperTokens from 'supertokens-auth-react';
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword';
import Session from 'supertokens-auth-react/recipe/session';
import { appConfig } from '../config/app';

let initialized = false;

export function initSuperTokens(): void {
  if (initialized) return;
  initialized = true;

  SuperTokens.init({
    appInfo: {
      appName: appConfig.name,
      apiDomain: appConfig.superTokensApiDomain,
      websiteDomain: appConfig.websiteDomain,
      apiBasePath: '/auth',
      websiteBasePath: '/auth',
    },
    recipeList: [
      EmailPassword.init(),
      Session.init({
        tokenTransferMethod: 'header',
      }),
    ],
  });
}
