import { seed } from '../src/services/seed.service';

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  });
