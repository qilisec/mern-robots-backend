const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const db = require('./db');
const robotsRouter = require('./routes/robotsRouter');

const app = express();
const apiPort = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

db.once('open', () => {
  console.log('database connected');
});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.get('/', (req, res) => {
  res.send('Robot Backend Home');
});

app.use('/api', robotsRouter);

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));
