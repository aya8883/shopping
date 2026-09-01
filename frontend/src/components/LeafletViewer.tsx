import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import { useTranslation } from 'react-i18next';
import type { LeafletOfferHotspot } from '../data/leafletHotspots';
import { useAppContext } from '../contexts/AppContext';
import { formatSar } from '../utils/pricing';

export type LeafletPage = {
  id: string;
  page_number: number;
  image_url?: string | null;
  processing_status?: string | null;
  hotspots?: LeafletOfferHotspot[];
};

export function LeafletViewer({
  pages,
  sourceUrl,
  storeName,
  accentColor = '#0D9488',
  getQuantity,
  onHotspotSelect,
}: {
  pages: LeafletPage[];
  sourceUrl?: string | null;
  storeName: string;
  accentColor?: string;
  /** Uses canonical productId */
  getQuantity?: (productId: string) => number;
  onHotspotSelect?: (hotspot: LeafletOfferHotspot) => void;
}) {
  const { t } = useTranslation();
  const { locale } = useAppContext();
  const sorted = [...pages].sort((a, b) => a.page_number - b.page_number);
  const [pageIndex, setPageIndex] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setPageIndex(0);
    setActiveId(null);
  }, [pages]);

  if (!sorted.length) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
        <Typography color="text.secondary">{t('offers.noPages')}</Typography>
        {sourceUrl ? (
          <Button href={sourceUrl} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewIcon />} sx={{ mt: 1.5 }}>
            {t('offers.openOfficial')}
          </Button>
        ) : null}
      </Paper>
    );
  }

  const page = sorted[Math.min(pageIndex, sorted.length - 1)];
  const hotspots = page.hotspots ?? [];
  const interactive = Boolean(onHotspotSelect && hotspots.length);

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AutoStoriesOutlinedIcon sx={{ fontSize: 18, color: accentColor }} />
          <Typography variant="subtitle2" fontWeight={800}>
            {t('offers.leafletPages', { store: storeName })}
          </Typography>
        </Stack>
        <Chip
          size="small"
          label={t('offers.pageOf', { current: pageIndex + 1, total: sorted.length })}
          sx={{ bgcolor: accentColor, color: '#fff', fontWeight: 800 }}
        />
      </Stack>

      {interactive ? (
        <Typography variant="body2" color="text.secondary" fontWeight={600} textAlign="center">
          {t('offers.tapLeafletHint')}
        </Typography>
      ) : null}

      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          border: `1px solid ${accentColor}33`,
        }}
      >
        <Box sx={{ position: 'relative', lineHeight: 0 }}>
          <Box
            component="img"
            src={page.image_url ?? undefined}
            alt={`${storeName} leaflet page ${page.page_number}`}
            sx={{
              display: 'block',
              width: '100%',
              maxHeight: { xs: 420, sm: 560 },
              objectFit: 'contain',
              mx: 'auto',
              bgcolor: '#fff',
            }}
          />

          {interactive
            ? hotspots.map((hotspot) => {
                const name = locale === 'ar' ? hotspot.nameAr : hotspot.name;
                const qty = getQuantity?.(hotspot.productId) ?? 0;
                const active = activeId === hotspot.id;

                return (
                  <Box
                    key={hotspot.id}
                    component="button"
                    type="button"
                    aria-label={`${t('offers.tapToAdd', { name })} · ${formatSar(hotspot.price, locale)}`}
                    onClick={() => onHotspotSelect?.(hotspot)}
                    onMouseEnter={() => setActiveId(hotspot.id)}
                    onMouseLeave={() => setActiveId(null)}
                    onTouchStart={() => setActiveId(hotspot.id)}
                    onTouchEnd={() => setActiveId(null)}
                    sx={{
                      position: 'absolute',
                      left: `${hotspot.x}%`,
                      top: `${hotspot.y}%`,
                      width: `${hotspot.width}%`,
                      height: `${hotspot.height}%`,
                      p: 0,
                      border: '2px solid',
                      borderColor: active ? '#FACC15' : 'transparent',
                      borderRadius: 2,
                      bgcolor: active ? 'rgba(250,204,21,0.12)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'border-color 120ms ease, background-color 120ms ease',
                      '&:hover': {
                        borderColor: '#FACC15',
                        bgcolor: 'rgba(250,204,21,0.12)',
                      },
                    }}
                  >
                    {active ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 6,
                          insetInlineStart: '50%',
                          transform: 'translateX(-50%)',
                          px: 1,
                          py: 0.35,
                          borderRadius: 1,
                          bgcolor: 'rgba(0,0,0,0.78)',
                          color: '#fff',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                        }}
                      >
                        <Typography variant="caption" fontWeight={800}>
                          {formatSar(hotspot.price, locale)}
                        </Typography>
                      </Box>
                    ) : null}
                    {qty > 0 ? (
                      <Chip
                        size="small"
                        label={`×${qty}`}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          insetInlineEnd: 4,
                          height: 22,
                          bgcolor: accentColor,
                          color: accentColor === '#F5C400' ? '#1A1A1A' : '#fff',
                          fontWeight: 800,
                          pointerEvents: 'none',
                        }}
                      />
                    ) : null}
                  </Box>
                );
              })
            : null}
        </Box>

        <IconButton
          size="small"
          disabled={pageIndex <= 0}
          onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
          sx={{ position: 'absolute', top: '50%', left: 6, transform: 'translateY(-50%)', bgcolor: '#fff', zIndex: 2 }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          size="small"
          disabled={pageIndex >= sorted.length - 1}
          onClick={() => setPageIndex((i) => Math.min(sorted.length - 1, i + 1))}
          sx={{ position: 'absolute', top: '50%', right: 6, transform: 'translateY(-50%)', bgcolor: '#fff', zIndex: 2 }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Paper>
    </Stack>
  );
}
