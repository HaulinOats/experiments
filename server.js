const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 8080;
const publicPath = path.join(__dirname, 'client');

//db for galaga
const jsonDB = require('simple-json-db');
const db = new jsonDB('./client/galaga/highScores.json');

app.use(express.static(publicPath));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', (req, res)=>{
  res.sendFile(publicPath + '/index.html');
})

app.get('/galaga', (req, res)=>{
  res.sendFile(publicPath + '/galaga');
})

app.get('/galaga/high-scores', (req, res)=>{
  res.send(db.get('highScores'));
})

app.post('/galaga/high-scores', (req, res)=>{
  db.set('highScores', req.body.highScores);
  res.send(true);
})

app.listen(port, ()=>{
  console.log('listening at port:', port);
});