const path = require('path');
const express = require('express');
const app = express();
const port = process.env.port || 8080;
const publicPath = path.join(__dirname, 'client');

app.use(express.static(publicPath));

app.get('/galaga', (req, res)=>{
  res.sendFile(publicPath + '/galaga');
})

app.listen(port, ()=>{
  console.log('listening at port:', port);
});