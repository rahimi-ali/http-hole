const formatter = new Intl.DateTimeFormat(
  'sv-SE',
  { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' },
);

export function formatDateTime(date: Date): string {
  return formatter.format(date);
}