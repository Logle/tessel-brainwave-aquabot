
var tessel = require('tessel');
var http = require('http');
var accel = require('accel-mma84').use(tessel.port['A']);

var led1 = tessel.led[1];
var current = 0;

accel.on('ready', function () {
  accel.on('data', function (xyz) {
    current = xyz[2]; // set to z value
  });
});

accel.on('error', function(err){
  console.log('Error:', err);
});

tessel.button.on('press', function() {
  var sentiment = current * 5;

  if( sentiment <= 1.5 && sentiment >= -1.5 ) {
    sentiment = 0;
  } else if( sentiment > 5 ) {
    sentiment = 5;
  } else if( sentiment < -5 ) {
    sentiment = -5;
  } else {
    sentiment = Math.round(sentiment);
  }

  postSentiment(sentiment);
});

function postSentiment(currentSentiment) {

  led1.output(1);

  var sentiment = {
    datetime: new Date().toISOString(),
    sentiment: currentSentiment
  };

  var options = {
    hostname: '192.168.1.42',
    port: 9000,
    path: '/api/session/chart',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': sentiment.length
    }
  };

  var req = http.request(options, function(res) {
    led1.output(0);
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.write( JSON.stringify( sentiment )  );
  req.end();

}
