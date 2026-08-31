export function checkFreshness(
  stores: Array<{ slug: string; name_en: string; id: string }>,
  leaflets: Array<{
    supermarket: { id: string; slug: string };
    end_date: string;
    offers?: unknown[];
  }>,
  todayIso = new Date().toISOString().slice(0, 10),
) {
  const today = new Date(todayIso);
  return {
    checkedAt: new Date().toISOString(),
    stores: stores.map((store) => {
      const leaflet = leaflets.find(
        (l) => l.supermarket.id === store.id || l.supermarket.slug === store.slug,
      );
      if (!leaflet) {
        return {
          slug: store.slug,
          name_en: store.name_en,
          hasPublishedLeaflet: false,
          stale: true,
        };
      }
      const end = new Date(leaflet.end_date);
      const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / 86400000);
      return {
        slug: store.slug,
        name_en: store.name_en,
        hasPublishedLeaflet: true,
        end_date: leaflet.end_date,
        daysRemaining,
        offerCount: leaflet.offers?.length ?? 0,
        stale: daysRemaining < 0,
      };
    }),
  };
}
