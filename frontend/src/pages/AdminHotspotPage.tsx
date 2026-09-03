import { useMemo, useRef, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import { mockSupermarkets } from '../data/catalog';
import {
  CANONICAL_PRODUCTS,
  getLeafletHotspots,
  saveHotspots,
  type LeafletOfferHotspot,
  type LeafletHotspotPage,
} from '../data/leafletHotspots';
import { leafletManifest } from '../data/leafletManifest';

type DraftRect = { x: number; y: number; width: number; height: number };

export function AdminHotspotPage() {
  const { t } = useTranslation();
  const [storeSlug, setStoreSlug] = useState('panda');
  const [pageNumber, setPageNumber] = useState(1);
  const [productId, setProductId] = useState(CANONICAL_PRODUCTS[0]?.id ?? '');
  const [price, setPrice] = useState('4.99');
  const [oldPrice, setOldPrice] = useState('');
  const [draft, setDraft] = useState<DraftRect | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [saved, setSaved] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const imageUrl = useMemo(() => {
    const store = (leafletManifest.stores as Record<string, { pages?: { page_number: number; image_url: string }[] }>)[storeSlug];
    return store?.pages?.find((p) => p.page_number === pageNumber)?.image_url ?? '';
  }, [storeSlug, pageNumber]);

  const existing = useMemo(
    () => getLeafletHotspots(storeSlug, pageNumber),
    [storeSlug, pageNumber, saved],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    const box = imgRef.current?.getBoundingClientRect();
    if (!box) return;
    const x = ((e.clientX - box.left) / box.width) * 100;
    const y = ((e.clientY - box.top) / box.height) * 100;
    setDragStart({ x, y });
    setDraft({ x, y, width: 0, height: 0 });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart || !imgRef.current) return;
    const box = imgRef.current.getBoundingClientRect();
    const x2 = ((e.clientX - box.left) / box.width) * 100;
    const y2 = ((e.clientY - box.top) / box.height) * 100;
    setDraft({
      x: Math.min(dragStart.x, x2),
      y: Math.min(dragStart.y, y2),
      width: Math.abs(x2 - dragStart.x),
      height: Math.abs(y2 - dragStart.y),
    });
  };

  const onPointerUp = () => setDragStart(null);

  const saveHotspot = () => {
    if (!draft || draft.width < 2 || draft.height < 2) return;
    const canonical = CANONICAL_PRODUCTS.find((p) => p.id === productId);
    if (!canonical) return;

    const hotspot: LeafletOfferHotspot = {
      id: `${storeSlug}-offer-${productId}-${Date.now()}`,
      productId,
      name: canonical.name_en,
      nameAr: canonical.name_ar,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      unit: canonical.unit_label_en,
      unitAr: canonical.unit_label_ar,
      supermarket: storeSlug,
      x: draft.x,
      y: draft.y,
      width: draft.width,
      height: draft.height,
    };

    const page: LeafletHotspotPage = {
      page_number: pageNumber,
      hotspots: [...existing.filter((h) => h.productId !== productId), hotspot],
    };

    const otherPages = [1, 2, 3]
      .filter((n) => n !== pageNumber)
      .map((n) => ({ page_number: n, hotspots: getLeafletHotspots(storeSlug, n) }))
      .filter((p) => p.hotspots.length);

    saveHotspots(storeSlug, [...otherPages, page]);
    setDraft(null);
    setSaved((v) => !v);
  };

  return (
    <Stack spacing={2} className="pb-4">
      <Typography variant="h5" fontWeight={800}>
        {t('admin.hotspotsTitle')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('admin.hotspotsHint')}
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <TextField select label={t('admin.store')} value={storeSlug} onChange={(e) => setStoreSlug(e.target.value)} size="small" sx={{ minWidth: 180 }}>
          {mockSupermarkets.map((s) => (
            <MenuItem key={s.slug} value={s.slug}>
              {s.name_en}
            </MenuItem>
          ))}
        </TextField>
        <TextField select label={t('admin.page')} value={pageNumber} onChange={(e) => setPageNumber(Number(e.target.value))} size="small" sx={{ width: 120 }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </TextField>
        <TextField select label={t('admin.product')} value={productId} onChange={(e) => setProductId(e.target.value)} size="small" sx={{ minWidth: 220 }}>
          {CANONICAL_PRODUCTS.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name_en}
            </MenuItem>
          ))}
        </TextField>
        <TextField label={t('admin.price')} value={price} onChange={(e) => setPrice(e.target.value)} size="small" sx={{ width: 100 }} />
        <TextField label={t('admin.oldPrice')} value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} size="small" sx={{ width: 100 }} />
      </Stack>

      {!imageUrl ? <Alert severity="warning">{t('admin.noLeafletImage')}</Alert> : null}

      <Paper sx={{ p: 1, borderRadius: 3 }}>
        <Box
          ref={imgRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          sx={{ position: 'relative', touchAction: 'none', cursor: 'crosshair', lineHeight: 0 }}
        >
          {imageUrl ? (
            <Box component="img" src={imageUrl} alt="" sx={{ width: '100%', display: 'block' }} />
          ) : null}
          {existing.map((h) => (
            <Box
              key={h.id}
              sx={{
                position: 'absolute',
                left: `${h.x}%`,
                top: `${h.y}%`,
                width: `${h.width}%`,
                height: `${h.height}%`,
                border: '1px dashed rgba(0,107,63,0.7)',
                pointerEvents: 'none',
              }}
            />
          ))}
          {draft && draft.width > 0 ? (
            <Box
              sx={{
                position: 'absolute',
                left: `${draft.x}%`,
                top: `${draft.y}%`,
                width: `${draft.width}%`,
                height: `${draft.height}%`,
                border: '2px solid #FACC15',
                bgcolor: 'rgba(250,204,21,0.15)',
                pointerEvents: 'none',
              }}
            />
          ) : null}
        </Box>
      </Paper>

      <Button variant="contained" onClick={saveHotspot} disabled={!draft || draft.width < 2}>
        {t('admin.saveHotspot')}
      </Button>
    </Stack>
  );
}
