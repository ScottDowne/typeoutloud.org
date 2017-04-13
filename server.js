require('habitat').load();

var express = require('express');
var app = express();
var routes = require('./routes');
var compression = require('compression');
var helmet = require('helmet');
var csp = require('helmet-csp');
var frameguard = helmet.frameguard;

var bodyParser = require('body-parser');

app.set('trust proxy', true);

app.use(bodyParser.json());
app.use(compression());
app.use(helmet());

app.use(csp({
  directives:{
    scriptSrc: ["'self'", "https://*.shpg.org/", "https://www.google-analytics.com/"],
    connectSrc:["'self'"],
    childSrc:["'self'"],
    frameSrc: ["'self'"],
    imgSrc:["'self'", "https://www.google-analytics.com", "https://*.shpg.org/"],
    frameAncestors: ["'none'"]
  }
}));

app.use(helmet.hsts({
  maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
}));

app.use(function(req, resp, next){
  if (process.env.NODE_ENV === 'production') {
    if (req.headers['x-forwarded-proto'] != 'https') {
      return res.redirect('https://' + req.host + req.url);
    }
  }

  next();
});

app.post('/api/sheets/add/:channel', routes.sheets.add);
app.get('/api/sheets/read/:channel', routes.sheets.read);

app.use(express.static('public'));

app.listen(process.env.PORT, function () {
  console.log('Running server at: ' + process.env.PORT + '!');
});
