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
}: {
  pages: LeafletPage[];
  sourceUrl?: string | null;
  storeName: string;
}) {
  const { t } = useTranslation();
  const sorted = [...pages].sort((a, b) => a.page_number - b.page_number);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex(0);
  }, [pages]);

  if (!sorted.length) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Typography variant="subtitle1" fontWeight={800}>
          {t('offers.leafletPages', { store: storeName })}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            size="small"
            label={t('offers.pageOf', {
              current: pageIndex + 1,
              total: sorted.length,
            })}
          />
          {sourceUrl ? (
            <Button
              size="small"
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewIcon fontSize="small" />}
            >
              {t('offers.openOfficial')}
            </Button>
          ) : null}
        </Stack>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          bgcolor: 'rgba(15, 61, 58, 0.03)',
        }}
      >
        <Box
          component="img"
          src={page.image_url ?? undefined}
          alt={`${storeName} leaflet page ${page.page_number}`}
          sx={{
            display: 'block',
            width: '100%',
            maxHeight: { xs: 480, sm: 640 },
            objectFit: 'contain',
            mx: 'auto',
            bgcolor: '#fff',
          }}
        />

        <IconButton
          aria-label={t('offers.prevPage')}
          disabled={!canPrev}
          onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
          sx={{
            position: 'absolute',
            top: '50%',
            left: 8,
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255,255,255,0.92)',
            boxShadow: 1,
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          aria-label={t('offers.nextPage')}
          disabled={!canNext}
          onClick={() => setPageIndex((i) => Math.min(sorted.length - 1, i + 1))}
          sx={{
            position: 'absolute',
            top: '50%',
            right: 8,
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255,255,255,0.92)',
            boxShadow: 1,
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Paper>

      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
        {sorted.map((p, index) => (
          <Box
            key={p.id}
            component="button"
            type="button"
            onClick={() => setPageIndex(index)}
            aria-label={t('offers.goToPage', { page: p.page_number })}
            aria-current={index === pageIndex ? 'true' : undefined}
            sx={{
              border: index === pageIndex ? '2px solid' : '1px solid',
              borderColor: index === pageIndex ? 'primary.main' : 'divider',
              borderRadius: 1.5,
              p: 0.25,
              bgcolor: '#fff',
              cursor: 'pointer',
              width: 56,
              height: 72,
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={p.image_url ?? undefined}
              alt=""
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
