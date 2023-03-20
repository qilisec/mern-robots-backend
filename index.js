const https = require('https');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const db = require('./db');
const robotsRouter = require('./routes/robotsRouter');
const usersRouter = require('./routes/usersRouter');

const app = express();
const apiPort = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: true }));
// When below was enabled: On Refresh Token Frontend Function: Access to XMLHttpRequest at 'https://localhost:3000/api/authentication/refresh' from origin 'https://localhost:8000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.
// app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept'
  );
  res.setHeader('Access-Control-Expose-Headers', 'Authorization');
  next();
});

db.once('open', async () => {
  console.log('database connected');
});
// const dbOnStartup = dbStartupTesting();
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

https
  .createServer(
    {
      ca: fs.readFileSync('./keys/ca.pem'),
      cert: fs.readFileSync('./keys/cert.pem'),
      key: fs.readFileSync('./keys/cert-key.pem'),
    },
    app
  )
  .listen(apiPort, () => {
    console.log(`Server running on port ${apiPort}`);
  });

app.get('/', (req, res) => {
  res.setHeader('current-function', 'index.js BACK init');
  res.send('Robot Backend Home');
});

app.use('/api', robotsRouter);
app.use('/api', usersRouter);
