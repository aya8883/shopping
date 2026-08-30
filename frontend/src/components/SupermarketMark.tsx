import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import {
  supermarketBrandColors,
  supermarketLogoUrl,
  supermarketShortName,
  type SupermarketLike,
} from '../utils/supermarketBranding';

const SIZES = {
  sm: { avatar: 28, fontSize: '0.95rem', gap: 0.75 },
  md: { avatar: 36, fontSize: '1.1rem', gap: 1 },
  lg: { avatar: 44, fontSize: '1.35rem', gap: 1.25 },
} as const;

export function SupermarketAvatar({
  store,
  size = 'md',
}: {
  store?: SupermarketLike | null;
  size?: keyof typeof SIZES;
}) {
  const dims = SIZES[size];
  const logo = supermarketLogoUrl(store);
  const colors = supermarketBrandColors(store);
  const initial = (store?.name_en ?? store?.name_ar ?? '?').slice(0, 1).toUpperCase();

  return (
    <Avatar
      src={logo ?? undefined}
      alt={store?.name_en ?? store?.name_ar ?? 'supermarket'}
      sx={{
        width: dims.avatar,
        height: dims.avatar,
        bgcolor: colors.bg,
        color: colors.fg,
        fontWeight: 800,
        fontSize: dims.avatar * 0.38,
        border: '1px solid rgba(15, 61, 58, 0.08)',
        flexShrink: 0,
        overflow: 'hidden',
        '& img': {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        },
      }}
    >
      {initial}
    </Avatar>
  );
}

export function SupermarketMark({
  store,
  locale,
  size = 'md',
  prefix,
  sx,
}: {
  store?: SupermarketLike | null;
  locale: string;
  size?: keyof typeof SIZES;
  prefix?: string;
  sx?: SxProps<Theme>;
}) {
  const dims = SIZES[size];
  const label = supermarketShortName(store, locale);
  const text = prefix ? `${prefix}${label}` : label;

  return (
    <Stack direction="row" alignItems="center" spacing={dims.gap} sx={sx}>
      <SupermarketAvatar store={store} size={size} />
      <Typography
        component="span"
        fontWeight={800}
        sx={{
          fontSize: dims.fontSize,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}
