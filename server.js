const path = require('path');
const express = require('express');
const app = express();
const port = process.env.port || 8080;

app.use(express.static(path.join(__dirname, 'client')));

app.listen(port, ()=>{
  console.log('listening at port:', port);
});