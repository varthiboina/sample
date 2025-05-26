const express = require('express');
const app = express();
const port = 3004;

app.get('/', (req, res) => {
  res.send('Hello World !! retrotale hahaha');
});

app.get('/hello', (req, res) => {
  res.status(200).json({message : 'Hello from Retrotale git'});
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});