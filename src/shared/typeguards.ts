export function isRecord(value: Record<string, unknown> | unknown | null | undefined): value is Record<string, unknown> {
  const val = value as Record<string, unknown>;

  return typeof val === 'object' && !Array.isArray(val);
}