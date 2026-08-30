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

export type LeafletPage = {
  id: string;
  page_number: number;
  image_url?: string | null;
  processing_status?: string | null;
};

export function LeafletViewer({
  pages,
  sourceUrl,
  storeName,
  accentColor = '#0D9488',
}: {
  pages: LeafletPage[];
  sourceUrl?: string | null;
  storeName: string;
  accentColor?: string;
}) {
  const { t } = useTranslation();
  const sorted = [...pages].sort((a, b) => a.page_number - b.page_number);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex(0);
  }, [pages]);

  if (!sorted.length) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 4,
          background: 'linear-gradient(160deg, #fff, rgba(240,253,250,0.8))',
        }}
      >
        <Typography color="text.secondary">{t('offers.noPages')}</Typography>
        {sourceUrl ? (
          <Button
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon />}
            sx={{ mt: 1.5 }}
          >
            {t('offers.openOfficial')}
          </Button>
        ) : null}
      </Paper>
    );
  }

  const page = sorted[Math.min(pageIndex, sorted.length - 1)];
  const canPrev = pageIndex > 0;
  const canNext = pageIndex < sorted.length - 1;

  return (
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        gap={1}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: `${accentColor}18`,
              color: accentColor,
              flexShrink: 0,
            }}
          >
            <AutoStoriesOutlinedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Typography
            variant="subtitle2"
            fontWeight={800}
            noWrap
            sx={{ minWidth: 0 }}
          >
            {t('offers.leafletPages', { store: storeName })}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}
        >
          <Chip
            size="small"
            label={t('offers.pageOf', {
              current: pageIndex + 1,
              total: sorted.length,
            })}
            sx={{
              height: 26,
              bgcolor: accentColor,
              color: '#fff',
              fontWeight: 800,
              '& .MuiChip-label': { px: 1, fontSize: '0.72rem' },
            }}
          />
          {sourceUrl ? (
            <Button
              size="small"
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
              sx={{
                fontWeight: 700,
                minHeight: 28,
                px: 1,
                fontSize: '0.75rem',
                '& .MuiButton-endIcon': { ml: 0.5 },
              }}
            >
              {t('offers.openOfficial')}
            </Button>
          ) : null}
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          border: `1px solid ${accentColor}33`,
          background: `linear-gradient(180deg, ${accentColor}12, rgba(255,255,255,0.95) 28%)`,
          boxShadow: `0 14px 32px ${accentColor}1f`,
        }}
      >
        <Box
          component="img"
          key={page.id}
          src={page.image_url ?? undefined}
          alt={`${storeName} leaflet page ${page.page_number}`}
          className="animate-fade-in"
          sx={{
            display: 'block',
            width: '100%',
            maxHeight: { xs: 420, sm: 560 },
            objectFit: 'contain',
            mx: 'auto',
            bgcolor: '#fff',
          }}
        />

        <IconButton
          size="small"
          aria-label={t('offers.prevPage')}
          disabled={!canPrev}
          onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
          sx={{
            position: 'absolute',
            top: '50%',
            left: 6,
            transform: 'translateY(-50%)',
            width: 32,
            height: 32,
            bgcolor: 'rgba(255,255,255,0.95)',
            color: accentColor,
            boxShadow: '0 4px 12px rgba(15,61,58,0.14)',
            '&:hover': { bgcolor: '#fff' },
            '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.55)' },
            '& .MuiSvgIcon-root': { fontSize: 18 },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          size="small"
          aria-label={t('offers.nextPage')}
          disabled={!canNext}
          onClick={() => setPageIndex((i) => Math.min(sorted.length - 1, i + 1))}
          sx={{
            position: 'absolute',
            top: '50%',
            right: 6,
            transform: 'translateY(-50%)',
            width: 32,
            height: 32,
            bgcolor: 'rgba(255,255,255,0.95)',
            color: accentColor,
            boxShadow: '0 4px 12px rgba(15,61,58,0.14)',
            '&:hover': { bgcolor: '#fff' },
            '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.55)' },
            '& .MuiSvgIcon-root': { fontSize: 18 },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Paper>

      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
        {sorted.map((p, index) => {
          const selected = index === pageIndex;
          return (
            <Box
              key={p.id}
              component="button"
              type="button"
              onClick={() => setPageIndex(index)}
              aria-label={t('offers.goToPage', { page: p.page_number })}
              aria-current={selected ? 'true' : undefined}
              sx={{
                border: selected ? '2px solid' : '1px solid',
                borderColor: selected ? accentColor : 'rgba(15,118,110,0.14)',
                borderRadius: 1.5,
                p: 0.25,
                bgcolor: '#fff',
                cursor: 'pointer',
                width: 48,
                height: 64,
                overflow: 'hidden',
                boxShadow: selected
                  ? `0 8px 16px ${accentColor}33`
                  : '0 3px 10px rgba(15,61,58,0.06)',
                transform: selected ? 'translateY(-1px)' : 'none',
                transition: 'transform 160ms ease, box-shadow 160ms ease',
              }}
            >
              <Box
                component="img"
                src={p.image_url ?? undefined}
                alt=""
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}
