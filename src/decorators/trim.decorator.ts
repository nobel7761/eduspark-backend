import { Transform } from 'class-transformer';

export function Trim() {
  return Transform(
    ({ value }: { value: unknown }): string | null | undefined => {
      if (typeof value === 'string') return value.trim();
      return value as null | undefined;
    },
  );
}
