import { useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { useTranslation } from 'react-i18next';
import { GET_SUPERMARKETS } from '../graphql/products/queries';
import { useAppContext } from '../contexts/AppContext';
import { SupermarketAvatar } from './SupermarketMark';
import { supermarketShortName } from '../utils/supermarketBranding';

type Supermarket = {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  logo_url?: string | null;
};

export function SupermarketFilter({ dense = false }: { dense?: boolean }) {
  const { t } = useTranslation();
  const {
    locale,
    selectedSupermarketIds,
    setSelectedSupermarketIds,
    toggleSupermarket,
  } = useAppContext();

  const { data, loading } = useQuery(GET_SUPERMARKETS);
  const stores: Supermarket[] = data?.supermarkets ?? [];

  // First visit: select every supermarket by default
  useEffect(() => {
    if (!stores.length) return;
    if (localStorage.getItem('wain-awfar.selected-supermarket-ids') === null) {
      setSelectedSupermarketIds(stores.map((s) => s.id));
    }
  }, [stores, setSelectedSupermarketIds]);

  const allSelected = useMemo(
    () => stores.length > 0 && stores.every((s) => selectedSupermarketIds.includes(s.id)),
    [stores, selectedSupermarketIds],
  );

  if (loading && !stores.length) {
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={120} height={40} />
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={dense ? 0.75 : 1.25}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Typography variant={dense ? 'body2' : 'subtitle2'} fontWeight={700}>
          {t('product.compareStores')}
        </Typography>
        <Button
          size="small"
          onClick={() =>
            setSelectedSupermarketIds(allSelected ? [] : stores.map((s) => s.id))
          }
        >
          {allSelected ? t('product.clearStores') : t('product.selectAllStores')}
        </Button>
      </Stack>
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
        {stores.map((store) => {
          const selected = selectedSupermarketIds.includes(store.id);
          const label = supermarketShortName(store, locale);
          return (
            <Chip
              key={store.id}
              avatar={<SupermarketAvatar store={store} size="sm" />}
              label={label}
              clickable
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              onClick={() => toggleSupermarket(store.id)}
              aria-pressed={selected}
              sx={{
                height: 40,
                pl: 0.5,
                '& .MuiChip-label': {
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  px: 1.25,
                },
                '& .MuiChip-avatar': {
                  width: 28,
                  height: 28,
                  marginInlineStart: '4px',
                  marginInlineEnd: '-4px',
                },
              }}
            />
          );
        })}
      </Stack>
      {selectedSupermarketIds.length === 0 ? (
        <Typography variant="caption" color="warning.main">
          {t('product.selectStoreHint')}
        </Typography>
      ) : null}
    </Stack>
  );
}
