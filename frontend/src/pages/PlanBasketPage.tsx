import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from 'react-i18next';
import { GET_CATALOG_FOR_PLANNER } from '../graphql/products/planner';
import { useAppContext } from '../contexts/AppContext';
import { useBasket } from '../contexts/BasketContext';
import { StepBadge, Surface } from '../components/ui/Surface';
import { formatSar } from '../utils/pricing';
import {
  NEED_PRESETS,
  suggestBasketPlan,
  type CatalogProduct,
  type PlannerNeed,
  type PlanSuggestion,
} from '../utils/basketPlanner';
import { SupermarketFilter } from '../components/SupermarketFilter';

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function PlanBasketPage() {
  const { t } = useTranslation();
  const { locale, selectedSupermarketIds } = useAppContext();
  const { addItem, clearBasket } = useBasket();

  const [needs, setNeeds] = useState<PlannerNeed[]>(() =>
    NEED_PRESETS.slice(0, 4).map((preset) => ({
      ...preset,
      id: newId(),
      quantity: 1,
      brandPreference: null,
    })),
  );
  const [customLabel, setCustomLabel] = useState('');
  const [plan, setPlan] = useState<PlanSuggestion | null>(null);

  const { data, loading, error } = useQuery(GET_CATALOG_FOR_PLANNER, {
    variables: { limit: 100 },
  });

  const catalog: CatalogProduct[] = data?.products ?? [];

  const brandOptions = useMemo(() => {
    const map = new Map<string, { en: string; ar: string }>();
    for (const p of catalog) {
      if (!p.brand?.name_en) continue;
      map.set(p.brand.name_en.toLowerCase(), {
        en: p.brand.name_en,
        ar: p.brand.name_ar ?? p.brand.name_en,
      });
    }
    return [...map.values()].sort((a, b) => a.en.localeCompare(b.en));
  }, [catalog]);

  const brandsForNeed = (need: PlannerNeed) => {
    const related = catalog.filter((p) => {
      const scoreKeywords = need.keywords.some((k) => {
        const blob = `${p.name_en} ${p.name_ar} ${p.category?.slug ?? ''}`.toLowerCase();
        return blob.includes(k.toLowerCase());
      });
      const scoreCat = need.categorySlugs?.includes(p.category?.slug ?? '');
      return scoreKeywords || scoreCat;
    });
    const map = new Map<string, { en: string; ar: string }>();
    for (const p of related) {
      if (!p.brand?.name_en) continue;
      map.set(p.brand.name_en.toLowerCase(), {
        en: p.brand.name_en,
        ar: p.brand.name_ar ?? p.brand.name_en,
      });
    }
    return [...map.values()];
  };

  const addPreset = (preset: (typeof NEED_PRESETS)[number]) => {
    setNeeds((prev) => [
      ...prev,
      { ...preset, id: newId(), quantity: 1, brandPreference: null },
    ]);
    setPlan(null);
  };

  const addCustom = () => {
    const label = customLabel.trim();
    if (!label) return;
    setNeeds((prev) => [
      ...prev,
      {
        id: newId(),
        labelEn: label,
        labelAr: label,
        keywords: label.split(/\s+/),
        quantity: 1,
        brandPreference: null,
      },
    ]);
    setCustomLabel('');
    setPlan(null);
  };

  const updateNeed = (id: string, patch: Partial<PlannerNeed>) => {
    setNeeds((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
    setPlan(null);
  };

  const removeNeed = (id: string) => {
    setNeeds((prev) => prev.filter((n) => n.id !== id));
    setPlan(null);
  };

  const runSuggest = () => {
    if (!needs.length || !catalog.length) return;
    const suggestion = suggestBasketPlan({
      needs,
      catalog,
      storeIds: selectedSupermarketIds,
    });
    setPlan(suggestion);
  };

  const applyToBasket = () => {
    if (!plan) return;
    clearBasket();
    for (const resolved of plan.resolved) {
      if (!resolved.product) continue;
      addItem({
        productId: resolved.product.id,
        quantity: resolved.need.quantity,
        name_en: resolved.product.name_en,
        name_ar: resolved.product.name_ar,
        size_value: resolved.product.size_value,
        size_unit: resolved.product.size_unit,
        brand_en: resolved.product.brand?.name_en,
        brand_ar: resolved.product.brand?.name_ar,
      });
    }
  };

  return (
    <Stack spacing={2.5} className="pb-4 animate-fade-in">
      <div>
        <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
          {t('plan.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t('plan.subtitle')}
        </Typography>
      </div>

      <Surface>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          <StepBadge step={1} />
          {t('plan.stepStores')}
        </Typography>
        <SupermarketFilter dense />
      </Surface>

      <Surface accent>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          <StepBadge step={2} />
          {t('plan.stepNeeds')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
          {t('plan.needsHint')}
        </Typography>

        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mb: 1.5 }}>
          {NEED_PRESETS.map((preset) => (
            <Chip
              key={preset.labelEn}
              clickable
              label={locale === 'ar' ? preset.labelAr : preset.labelEn}
              onClick={() => addPreset(preset)}
              variant="outlined"
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder={t('plan.customPlaceholder')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addCustom();
            }}
          />
          <Button variant="outlined" onClick={addCustom}>
            {t('plan.add')}
          </Button>
        </Stack>

        {!needs.length ? (
          <Alert severity="info">{t('plan.emptyNeeds')}</Alert>
        ) : (
          <Stack spacing={1.25}>
            {needs.map((need) => {
              const brands = brandsForNeed(need);
              return (
                <Paper key={need.id} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                      <Typography fontWeight={700}>
                        {locale === 'ar' ? need.labelAr : need.labelEn}
                      </Typography>
                      <IconButton size="small" onClick={() => removeNeed(need.id)} aria-label="remove">
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <TextField
                        select
                        size="small"
                        label={t('plan.quantity')}
                        value={need.quantity}
                        onChange={(e) =>
                          updateNeed(need.id, { quantity: Number(e.target.value) || 1 })
                        }
                        sx={{ minWidth: 100 }}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <MenuItem key={n} value={n}>
                            {n}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        select
                        size="small"
                        fullWidth
                        label={t('plan.brandOptional')}
                        value={need.brandPreference ?? ''}
                        onChange={(e) =>
                          updateNeed(need.id, {
                            brandPreference: e.target.value || null,
                          })
                        }
                        helperText={t('plan.brandHint')}
                      >
                        <MenuItem value="">{t('plan.anyBrand')}</MenuItem>
                        {(brands.length ? brands : brandOptions).map((b) => (
                          <MenuItem key={b.en} value={b.en}>
                            {locale === 'ar' ? b.ar : b.en}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Surface>

      <Button
        variant="contained"
        size="large"
        startIcon={<AutoAwesomeIcon />}
        disabled={loading || !needs.length || !catalog.length}
        onClick={runSuggest}
      >
        {t('plan.suggest')}
      </Button>

      {loading ? <Skeleton variant="rounded" height={120} /> : null}
      {error ? <Alert severity="error">{t('common.error')}</Alert> : null}

      {plan ? (
        <Surface>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            <StepBadge step={3} />
            {t('plan.stepResults')}
          </Typography>

          {plan.unmatchedLabels.length ? (
            <Alert severity="warning" sx={{ mb: 1.5 }}>
              {t('plan.unmatched', { items: plan.unmatchedLabels.join(', ') })}
            </Alert>
          ) : null}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('plan.matchedHint')}
          </Typography>
          <Stack spacing={1} sx={{ mb: 2 }}>
            {plan.resolved.map((r) => (
              <Paper key={r.need.id} variant="outlined" sx={{ p: 1.25 }}>
                <Stack direction="row" justifyContent="space-between" gap={1}>
                  <Box>
                    <Typography fontWeight={700}>
                      {locale === 'ar' ? r.need.labelAr : r.need.labelEn}
                      {r.need.brandPreference ? ` · ${r.need.brandPreference}` : ''}
                    </Typography>
                    {r.product ? (
                      <Typography variant="body2" color="text.secondary">
                        {(locale === 'ar' ? r.product.name_ar : r.product.name_en) +
                          ` ×${r.need.quantity}`}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="warning.main">
                        {t('plan.noMatch')}
                      </Typography>
                    )}
                  </Box>
                  {r.need.brandPreference ? (
                    <Chip size="small" color="secondary" label={t('plan.brandLocked')} />
                  ) : null}
                </Stack>
              </Paper>
            ))}
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            {t('plan.mixedTitle')}
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 1.5,
              borderRadius: 3,
              background:
                'linear-gradient(135deg, rgba(13,148,136,0.14), rgba(22,163,74,0.08))',
              border: '1px solid rgba(13,148,136,0.18)',
            }}
          >
            <Typography variant="overline">{t('list.mixedBasket')}</Typography>
            <Typography
              variant="h3"
              color="primary.dark"
              fontWeight={800}
              sx={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              {formatSar(plan.optimized.total, locale)}
            </Typography>
            {plan.optimized.savingVsBestSingleStore > 0 ? (
              <Chip
                sx={{ mt: 1 }}
                color="success"
                label={`${t('list.youSaveVsSingle')}: ${formatSar(plan.optimized.savingVsBestSingleStore, locale)}`}
              />
            ) : null}
          </Paper>

          {plan.optimized.byStore.map((store) => (
            <Paper key={store.supermarketId} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Typography fontWeight={700}>
                  {locale === 'ar' ? store.name_ar : store.name_en}
                </Typography>
                <Typography fontWeight={700}>{formatSar(store.subtotal, locale)}</Typography>
              </Stack>
              {store.lines.map((line) => (
                <Stack key={line.productId} direction="row" justifyContent="space-between">
                  <Typography variant="body2">
                    {(locale === 'ar' ? line.name_ar : line.name_en) + ` ×${line.quantity}`}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatSar(line.lineTotal, locale)}
                  </Typography>
                </Stack>
              ))}
            </Paper>
          ))}

          {plan.compared.best ? (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                {t('plan.singleTitle')}
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography fontWeight={700}>
                  {locale === 'ar' ? plan.compared.best.name_ar : plan.compared.best.name_en}
                </Typography>
                <Typography variant="h5" color="primary.dark" fontWeight={800}>
                  {formatSar(plan.compared.best.total ?? 0, locale)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('list.availability', {
                    available: plan.compared.best.availableCount,
                    total: plan.compared.best.totalCount,
                  })}
                </Typography>
              </Paper>
            </>
          ) : null}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" fullWidth onClick={applyToBasket}>
              {t('plan.addAllToList')}
            </Button>
            <Button component={RouterLink} to="/list" variant="outlined" fullWidth>
              {t('plan.openList')}
            </Button>
          </Stack>
        </Surface>
      ) : null}
    </Stack>
  );
}
