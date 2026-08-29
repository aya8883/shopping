import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';
import { SEARCH_PRODUCTS } from '../graphql/products/queries';
import { ProductCard, type ProductCardProduct } from '../features/products/ProductCard';

export function SearchPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';

  const searchPattern = useMemo(() => {
    const trimmed = q.trim();
    if (!trimmed) return '%';
    return `%${trimmed}%`;
  }, [q]);

  const { data, loading, error } = useQuery(SEARCH_PRODUCTS, {
    variables: { search: searchPattern, limit: 30 },
    skip: !q.trim(),
  });

  return (
    <Stack spacing={2} className="pb-4">
      <Typography variant="h5" fontWeight={700}>
        {t('search.title')}
      </Typography>
      <TextField
        fullWidth
        autoFocus
        value={q}
        onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {})}
        placeholder={t('search.placeholder')}
        helperText={t('search.hint')}
      />

      {!q.trim() ? (
        <Alert severity="info">{t('search.hint')}</Alert>
      ) : loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={110} />
        ))
      ) : error ? (
        <Alert severity="error">{t('common.error')}</Alert>
      ) : data?.products?.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.products.map((product: ProductCardProduct) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Alert severity="warning">{t('search.noResults')}</Alert>
      )}
    </Stack>
  );
}
