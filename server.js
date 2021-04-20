require('dotenv').config()
const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const publicPath = path.join(__dirname, 'client');
const querystring = require('querystring');
const bodyParser = require('body-parser');
const request = require('request');
const cookieParser = require('cookie-parser');
const stateKey = 'spotify_auth_state';
const client_id = process.env.client_id;
const client_secret = process.env.client_secret; 

//Scavenger Hunt mongo/mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.connect('mongodb+srv://brett84c:lisa84@cluster0.hahsw.mongodb.net/Scavenger-Hunt?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
  console.log('db connected');
}, 
err => {
  if(err) throw err;
});

const userSchema = new Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', userSchema);

let redirect_uri;
if(process.env.COMPUTERNAME === 'BRETTS-LAPTOP') {
  redirect_uri = `http://localhost:${port}/chronoalbums/callback`;
} else {
  redirect_uri = 'https://bc-experiments.herokuapp.com/chronoalbums/callback';
}

app.use(express.static(publicPath));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

//GALAGA ROUTES

//db for galaga high scores
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

app.get('/galaga/high-scores', (req, res)=>{
  res.send(db.get('highScores').value());
})

app.post('/galaga/high-scores', (req, res)=>{
  let highScores = db.get('highScores').value();
  highScores.push(req.body.newHighScore);
  highScores.sort((a,b)=>{
    if(a.score < b.score) return -1;
    if(a.score > b.score) return 1;
    else return 0;
  });
  highScores = highScores.slice(0, 12);
  db.set('highScores', highScores).write();
  res.send(true);
})

//CHRONOALBUM ROUTES
app.get('/login', (req, res) => {
  function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-library-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id,
      scope,
      redirect_uri,
      state,
      show_dialog:true
    }));
})

app.get('/chronoalbums/callback', (req, res) => {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        // console.log('access_token: ', access_token);

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          // console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/chronoalbums/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/chronoalbums/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', (req, res) => {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  console.log('refresh_token: ', refresh_token);
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    console.log('access_token: ', access_token)
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
})

app.listen(port, ()=>{
  console.log('listening at port:', port);
})
