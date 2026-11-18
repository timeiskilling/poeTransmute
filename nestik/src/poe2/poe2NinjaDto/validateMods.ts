export function stripMark(mods: string): string {
  return mods.replace(
    /\[([^\]]*)\]/g,
    (_match: string, inner: string): string => {
      const parts: string[] = inner.split('|');
      return parts[1] ?? parts[0] ?? '';
    },
  );
}

export function nomalize(input: string | string[]): string | string[] {
  if (Array.isArray(input)) {
    return input.map((line) => stripMark(line));
  }
  return stripMark(input);
}
