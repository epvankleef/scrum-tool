import { type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  buildCommand: 'pnpm build',
  framework: 'nextjs',
  crons: [
    { path: '/api/cron/burndown', schedule: '5 0 * * *' },
  ],
};
