import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GET_PRODUCT_BY_ID } from '../graphql/products/queries';
import { PriceComparisonPanel } from '../features/products/PriceComparisonPanel';
import { useAppContext } from '../contexts/AppContext';
import { useBasket } from '../contexts/BasketContext';

export function ProductDetailPage() {
  const { id = '' } = useParams();
  const { t } = useTranslation();
  const { locale } = useAppContext();
  const { addItem, getQuantity } = useBasket();
  const [toast, setToast] = useState(false);
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
  const inBasket = getQuantity(product.id);

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

      <Button
        variant="contained"
        size="large"
        onClick={() => {
          addItem({
            productId: product.id,
            name_en: product.name_en,
            name_ar: product.name_ar,
            size_value: product.size_value,
            size_unit: product.size_unit,
            brand_en: product.brand?.name_en,
            brand_ar: product.brand?.name_ar,
          });
          setToast(true);
        }}
      >
        {inBasket > 0
          ? t('product.addToListAgain', { count: inBasket })
          : t('product.addToList')}
      </Button>

      <Snackbar
        open={toast}
        autoHideDuration={2000}
        onClose={() => setToast(false)}
        message={t('product.addedToList')}
      />
    </Stack>
  );
}
