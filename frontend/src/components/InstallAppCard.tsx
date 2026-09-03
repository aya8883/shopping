import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IosShareIcon from '@mui/icons-material/IosShare';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import { useTranslation } from 'react-i18next';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

/**
 * PWA install affordance for beta mobile use.
 * Shows Android/Chrome install prompt when available; otherwise iOS Add to Home Screen hints.
 */
export function InstallAppCard() {
  const { t } = useTranslation();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const isIos =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window.navigator as Navigator & { standalone?: boolean }).standalone;

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: '1px solid rgba(26,26,26,0.08)',
        bgcolor: '#FFF8D6',
      }}
    >
      <Stack spacing={1.25}>
        <Typography fontWeight={900}>{t('profile.installTitle')}</Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {isIos ? t('profile.installIosHint') : t('profile.installHint')}
        </Typography>
        {deferred ? (
          <Button
            variant="contained"
            startIcon={<GetAppOutlinedIcon />}
            onClick={async () => {
              await deferred.prompt();
              await deferred.userChoice;
              setDeferred(null);
            }}
          >
            {t('profile.installCta')}
          </Button>
        ) : isIos ? (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <IosShareIcon fontSize="small" />
            <Typography variant="body2" fontWeight={700}>
              {t('profile.installIosSteps')}
            </Typography>
          </Stack>
        ) : (
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {t('profile.installBrowserHint')}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
