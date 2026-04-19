// Kies een positie-float die strikt tussen `prev` en `next` valt.
// Gebruikt voor sticky-volgorde binnen een kolom — gelijktijdige drops
// overschrijven elkaar niet. prev/next = null betekent begin/eind.
export function positionBetween(prev: number | null, next: number | null): number {
  if (prev == null && next == null) return 1;
  if (prev == null && next != null) return next - 1;
  if (prev != null && next == null) return prev + 1;
  return (prev! + next!) / 2;
}
