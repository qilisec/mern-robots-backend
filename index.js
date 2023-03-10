const os = require("os")
const https = require("https")
const fs = require("fs")
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const db = require('./db');
const robotsRouter = require('./routes/robotsRouter');

const app = express();
const apiPort = 3000;
console.log(`os type is ${os.type()}, platform is ${os.platform()}`)


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

db.once('open', () => {
  console.log('database connected');
});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

https
  .createServer(
    {
      key: fs.readFileSync("./keys/cert-key.pem"),
      cert: fs.readFileSync("./keys/cert.pem"),
    }, app)
  .listen(apiPort, () => {
    console.log(`Server running on port ${apiPort}`)
})

app.get('/', (req, res) => {
  res.send('Robot Backend Home');
});

app.use('/api', robotsRouter);

// app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));
