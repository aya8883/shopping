import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';
import { GET_PRODUCT_BY_ID } from '../graphql/products/queries';
import { PriceComparisonPanel } from '../features/products/PriceComparisonPanel';
import { useAppContext } from '../contexts/AppContext';

export function ProductDetailPage() {
  const { id = '' } = useParams();
  const { t } = useTranslation();
  const { locale } = useAppContext();
  const { data, loading, error } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id },
    skip: !id,
  });

  const product = data?.products_by_pk;

  if (loading) {
    return <Skeleton variant="rounded" height={360} />;
  }

  if (error || !product) {
    return <Alert severity="error">{t('common.error')}</Alert>;
  }

  const name = locale === 'ar' ? product.name_ar : product.name_en;
  const brand = locale === 'ar' ? product.brand?.name_ar : product.brand?.name_en;

  return (
    <Stack spacing={2.5} className="pb-4">
      <div>
        <Typography variant="h4" fontWeight={700}>
          {name}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {[brand, product.size_value && product.size_unit ? `${product.size_value}${product.size_unit}` : null]
            .filter(Boolean)
            .join(' · ')}
        </Typography>
        {product.offers?.some((o: { is_demo?: boolean }) => o.is_demo) ? (
          <Chip sx={{ mt: 1 }} size="small" label={t('app.demoBadge')} color="warning" />
        ) : null}
      </div>

      <Typography variant="h6" fontWeight={700}>
        {t('product.comparePrices')}
      </Typography>
      <PriceComparisonPanel
        offers={product.offers ?? []}
        sizeValue={product.size_value}
        sizeUnit={product.size_unit}
      />

      <Button variant="contained" size="large" disabled>
        {t('product.addToList')}
      </Button>
    </Stack>
  );
}
