// Tests run in Node; the app has no Node types.
declare const process: { env: Record<string, string> };

// Fixed zone so local-day bucketing (incl. the 2026-10-25 DST change) is deterministic.
process.env['TZ'] = 'Europe/Warsaw';
