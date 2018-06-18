'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require('dns');
var URL = require('url').URL;
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGO_URI);
var shortURLSchema = new mongoose.Schema({
  url: {type: String, required: true}
});
var ShortURL = mongoose.model('ShortURL', shortURLSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.post("/api/shorturl/new", function (req, res) {

  dns.lookup(new URL(req.body.url).hostname,

             function (lookupError, address, family) {
    
    if (lookupError) {
      res.send('{"error":"invalid URL"}');
      return;
    }

    let urlDoc = new ShortURL({
      url: req.body.url
    });

    urlDoc.save(function (error, data) {
      res.json({
        original_url: req.body.url,
        short_url: data.id
      });
    });
  });
});

app.get("/api/shorturl/:id", function (req, res) {
  
  ShortURL.findById(req.params.id, function (error, urlDoc) {
    if (!urlDoc) return res.status(404).end();
    res.set("Location", urlDoc.url);
    res.status(301).end();
  });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
