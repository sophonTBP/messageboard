'use strict';
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './sample.env') });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require("helmet");
const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');
const fs = require('fs');
const http = require('http');
const https = require('https');

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/clearstack.site/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/clearstack.site/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/clearstack.site/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};
const app = express();




app.use(
  helmet({
    referrerPolicy: { policy: "same-origin" },
    contentSecurityPolicy: {
      directives: {
        "scriptSrc": ["'self'", "localhost", "'unsafe-inline'", "code.jquery.com"], //loading of script
        //self is required
        //localhost is required (same as self)
        //loading from jquery for code.jquery.com
        //unsafe-inline covers JS in script tags
        "styleSrc": ["'self'"] //loading of stylesheet
      }
    }, frameguard: {
      action: "sameorigin",
    },dnsPrefetchControl:{
      allow: false,
    }
  })
);


app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
app.route('/b/:board/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
  });
app.route('/b/:board/:threadid')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/thread.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);




const httpListener = httpServer.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + httpListener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 1500);
  }
});

const httpsListener = httpsServer.listen(process.env.PORT || 3001, function () {
  console.log('Your app is listening on port ' + httpsListener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 1500);
  }
});

module.exports = app; //for testing
