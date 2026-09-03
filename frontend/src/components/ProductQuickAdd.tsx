import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import type { LeafletOfferHotspot } from '../data/leafletHotspots';
import { quotesForProduct } from '../data/leafletHotspots';
import { useAppContext } from '../contexts/AppContext';
import { formatSar } from '../utils/pricing';
import { SupermarketAvatar } from './SupermarketMark';
import { supermarketShortName } from '../utils/supermarketBranding';

export function ProductQuickAdd({
  hotspot,
  storeName,
  open,
  onClose,
  onAdd,
}: {
  hotspot: LeafletOfferHotspot | null;
  storeName: string;
  open: boolean;
  onClose: () => void;
  onAdd: (hotspot: LeafletOfferHotspot, quantity: number) => void;
}) {
  const { t } = useTranslation();
  const { locale } = useAppContext();
  const [quantity, setQuantity] = useState(1);

  if (!hotspot) return null;

  const name = locale === 'ar' ? hotspot.nameAr : hotspot.name;
  const unit = locale === 'ar' ? hotspot.unitAr : hotspot.unit;
  const quotes = quotesForProduct(hotspot.productId).sort((a, b) => a.price - b.price);

  const handleAdd = () => {
    onAdd(hotspot, quantity);
    setQuantity(1);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 3, m: 1.5 } }}
    >
      <DialogContent sx={{ p: 2.25 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ minWidth: 0, flex: 1, pe: 1 }}>
            <Typography variant="h6" fontWeight={900} lineHeight={1.25}>
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
              {unit} · {storeName}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label={t('common.close')}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Stack spacing={0.5} sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            {t('offers.currentPrice')}
          </Typography>
          <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography variant="h5" fontWeight={900} color="error.main">
              {formatSar(hotspot.price, locale)}
            </Typography>
            {hotspot.oldPrice && hotspot.oldPrice > hotspot.price ? (
              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                {formatSar(hotspot.oldPrice, locale)}
              </Typography>
            ) : null}
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mt: 2.5 }}>
          <Typography variant="body2" fontWeight={700}>
            {t('offers.quantity')}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label={t('offers.decreaseQty')}
          >
            <RemoveIcon />
          </IconButton>
          <Typography fontWeight={900} fontSize="1.25rem" sx={{ minWidth: 24, textAlign: 'center' }}>
            {quantity}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label={t('offers.increaseQty')}
          >
            <AddIcon />
          </IconButton>
        </Stack>

        {quotes.length > 1 ? (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              {t('offers.pricesAtOtherStores')}
            </Typography>
            <Stack spacing={0.75} sx={{ mt: 1 }}>
              {quotes.slice(0, 4).map((q) => (
                <Stack key={q.supermarketSlug} direction="row" alignItems="center" spacing={1}>
                  <SupermarketAvatar
                    store={{
                      slug: q.supermarketSlug,
                      name_en: q.supermarketNameEn,
                      name_ar: q.supermarketNameAr,
                      logo_url: null,
                    }}
                    size="sm"
                  />
                  <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }} noWrap>
                    {supermarketShortName(
                      { slug: q.supermarketSlug, name_en: q.supermarketNameEn, name_ar: q.supermarketNameAr },
                      locale,
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={800}
                    color={q.supermarketSlug === hotspot.supermarket ? 'text.primary' : 'text.secondary'}
                  >
                    {formatSar(q.price, locale)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </>
        ) : null}

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleAdd}
          sx={{ mt: 2.5, fontWeight: 800, borderRadius: 2 }}
        >
          {t('offers.addToList')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
