const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.deleteMany({}).then(r => {
  console.log('Deleted', r.count, 'users');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
