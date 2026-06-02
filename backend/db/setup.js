const { setupDatabase } = require('./index');

setupDatabase()
  .then(() => {
    console.log('Database setup finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database setup failed:', err);
    process.exit(1);
  });
