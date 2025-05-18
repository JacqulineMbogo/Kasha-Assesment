// server.js
const mongoose = require('mongoose');

const app = require('./app');

console.log('Connecting to DB:', process.env.DB_CONNECTION_STRING);

mongoose
  .connect(`${process.env.DB_CONNECTION_STRING}`)
  .then(() => {
    app.listen(process.env.PORT || 5001, () =>
      console.log('Server running on port 5001')
    );
  })
  .catch((err) => {
    console.error('DB connection failed', err);
  });