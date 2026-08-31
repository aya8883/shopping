import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import PublishedWithChangesOutlinedIcon from '@mui/icons-material/PublishedWithChangesOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { useTranslation } from 'react-i18next';
import { GET_SUPERMARKETS } from '../graphql/products/queries';
import { GET_CATALOG_FOR_PLANNER } from '../graphql/products/planner';
import {
  buildIngestDraft,
  clearPublishedLeaflets,
  computeFreshness,
  publishLeafletLocally,
  readPublishedLeaflets,
  thisWeekRange,
  type IngestDraft,
} from '../utils/leafletPipeline';
import { formatSar } from '../utils/pricing';
import { useAppContext } from '../contexts/AppContext';
import { supermarketShortName } from '../utils/supermarketBranding';

type Store = {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  logo_url?: string | null;
};

export function AdminLeafletsPage() {
  const { t } = useTranslation();
  const { locale } = useAppContext();
  const week = thisWeekRange();
  const { data } = useQuery(GET_SUPERMARKETS);
  const { data: catalogData } = useQuery(GET_CATALOG_FOR_PLANNER, {
    variables: { limit: 100 },
  });

  const stores: Store[] = data?.supermarkets ?? [];
  const catalog = catalogData?.products ?? [];
  const [storeId, setStoreId] = useState('');
  const [startDate, setStartDate] = useState(week.start);
  const [endDate, setEndDate] = useState(week.end);
  const [draft, setDraft] = useState<IngestDraft | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [publishedTick, setPublishedTick] = useState(0);

  const selected = stores.find((s) => s.id === storeId) ?? stores[0];

  const published = useMemo(() => {
    void publishedTick;
    return readPublishedLeaflets();
  }, [publishedTick]);

  const freshness = useMemo(
    () =>
      computeFreshness(
        stores.map((s) => ({ id: s.id, slug: s.slug, name_en: s.name_en })),
        published,
        week.today,
      ),
    [stores, published, week.today],
  );

  const runIngest = () => {
    const store = selected;
    if (!store) return;
    const next = buildIngestDraft({
      supermarket: store,
      start_date: startDate,
      end_date: endDate,
      catalog,
      source_url:
        store.slug === 'lulu'
          ? 'https://www.luluhypermarket.com/en-sa/promotions'
          : 'https://www.carrefourksa.com/mafsau/en/c/Offers',
    });
    setDraft(next);
    setToast(t('admin.ingestDone'));
  };

  const publish = () => {
    if (!draft) return;
    publishLeafletLocally(draft);
    setPublishedTick((n) => n + 1);
    setDraft({ ...draft, status: 'published' });
    setToast(t('admin.publishDone'));
  };

  const matchedCount = draft?.matches.filter((m) => m.product).length ?? 0;
  const unmatchedCount = draft?.matches.filter((m) => !m.product).length ?? 0;

  return (
    <Stack spacing={2.5} className="pb-4 animate-fade-in">
      <div>
        <Typography variant="h5" fontWeight={900}>
          {t('admin.leafletsTitle')}
        </Typography>
        <Typography color="text.secondary" fontWeight={600}>
          {t('admin.leafletsSubtitle')}
        </Typography>
      </div>

      <Alert severity="info">{t('admin.pipelineHint')}</Alert>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Typography fontWeight={800} sx={{ mb: 1.5 }}>
          {t('admin.freshness')}
        </Typography>
        <Stack spacing={1}>
          {freshness.stores.map((row) => (
            <Stack
              key={row.slug}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
              sx={{
                p: 1.25,
                borderRadius: 2,
                bgcolor: row.stale ? 'rgba(225,29,72,0.06)' : 'rgba(22,163,74,0.06)',
              }}
            >
              <Typography fontWeight={700}>{row.name_en}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {row.hasPublishedLeaflet ? (
                  <>
                    <Chip
                      size="small"
                      color={row.stale ? 'error' : 'success'}
                      label={
                        row.stale
                          ? t('admin.expired')
                          : t('admin.daysLeft', { count: row.daysRemaining ?? 0 })
                      }
                    />
                    <Chip size="small" label={t('offers.offerCount', { count: row.offerCount ?? 0 })} />
                  </>
                ) : (
                  <Chip size="small" color="warning" label={t('admin.missingLeaflet')} />
                )}
              </Stack>
            </Stack>
          ))}
        </Stack>
        <Button
          sx={{ mt: 1.5 }}
          size="small"
          startIcon={<RefreshOutlinedIcon />}
          onClick={() => setPublishedTick((n) => n + 1)}
        >
          {t('admin.refreshStatus')}
        </Button>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Typography fontWeight={800} sx={{ mb: 1.5 }}>
          {t('admin.ingestTitle')}
        </Typography>
        <Stack spacing={1.5}>
          <TextField
            select
            label={t('admin.supermarket')}
            value={selected?.id ?? ''}
            onChange={(e) => setStoreId(e.target.value)}
            fullWidth
          >
            {stores.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {supermarketShortName(s, locale)}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              label={t('admin.startDate')}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label={t('admin.endDate')}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="contained"
              size="large"
              startIcon={<CloudUploadOutlinedIcon />}
              onClick={runIngest}
              disabled={!selected}
              fullWidth
            >
              {t('admin.runIngest')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<PublishedWithChangesOutlinedIcon />}
              onClick={publish}
              disabled={!draft || matchedCount === 0}
              fullWidth
            >
              {t('admin.publish')}
            </Button>
          </Stack>
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              clearPublishedLeaflets();
              setPublishedTick((n) => n + 1);
              setDraft(null);
              setToast(t('admin.resetDone'));
            }}
          >
            {t('admin.resetPublished')}
          </Button>
        </Stack>
      </Paper>

      {draft ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Typography fontWeight={800}>{t('admin.reviewTitle')}</Typography>
            <Stack direction="row" spacing={1}>
              <Chip color="success" size="small" label={t('admin.matched', { count: matchedCount })} />
              <Chip
                color={unmatchedCount ? 'warning' : 'default'}
                size="small"
                label={t('admin.unmatched', { count: unmatchedCount })}
              />
              <Chip
                size="small"
                label={draft.status === 'published' ? t('admin.statusPublished') : t('admin.statusReview')}
              />
            </Stack>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {locale === 'ar' ? draft.title_ar : draft.title_en} · {draft.start_date} → {draft.end_date}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('admin.ocrLine')}</TableCell>
                  <TableCell>{t('admin.matchedProduct')}</TableCell>
                  <TableCell align="right">{t('admin.price')}</TableCell>
                  <TableCell align="right">{t('admin.score')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {draft.matches.map((m, i) => (
                  <TableRow key={`${m.offerBlock.rawText}-${i}`}>
                    <TableCell>
                      <Typography fontWeight={700} fontSize="0.85rem">
                        {m.offerBlock.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {m.offerBlock.promotion}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {m.product ? (
                        locale === 'ar' ? m.product.name_ar : m.product.name_en
                      ) : (
                        <Chip size="small" color="warning" label={t('admin.noMatch')} />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {formatSar(m.offer_price, locale)}
                      {m.regular_price != null ? (
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', textDecoration: 'line-through' }}
                        >
                          {formatSar(m.regular_price, locale)}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell align="right">{m.matchScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      ) : null}

      <Snackbar open={Boolean(toast)} autoHideDuration={2500} onClose={() => setToast(null)} message={toast} />
    </Stack>
  );
}
