const COMPARE_IDS_PARAM = 'ids';

export function normalizeCompareIds(ids: string[]) {
  return Array.from(
    new Set(
      ids
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function parseCompareIds(value: string | null) {
  if (!value) {
    return [];
  }

  return normalizeCompareIds(value.split(','));
}

export function buildComparePath(ids: string[]) {
  const normalized = normalizeCompareIds(ids);

  if (!normalized.length) {
    return '/compare';
  }

  const searchParams = new URLSearchParams();
  searchParams.set(COMPARE_IDS_PARAM, normalized.join(','));
  return `/compare?${searchParams.toString()}`;
}
