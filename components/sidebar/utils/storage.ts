export function safeParseStringArray(jsonString: string | null): string[] {
  if (!jsonString) return [];
  try {
    const parsed: unknown = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  } catch {
    return [];
  }
}
