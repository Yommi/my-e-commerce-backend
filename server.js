const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
console.log(`NODE ENVIRONMENT: ${process.env.NODE_ENV}`);

const app = require('./app');

const db = process.env.DB.replace(
  '<username>',
  process.env.DB_USERNAME
).replace('<password>', process.env.DB_PASSWORD);

mongoose.connect(db).then(() => {
  console.log('Database Connected ✅');
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
