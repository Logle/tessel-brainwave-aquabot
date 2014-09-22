
var tessel = require('tessel');
var ambientlib = require('ambient-attx4');
var ambient = ambientlib.use(tessel.port['A']);

var https = require('https');
var led1 = tessel.led[1];


ambient.on('ready', function () {
  setInterval( function () {
    ambient.getLightLevel( function(err, ldata) {
      if (err) throw err;
      console.log("Light level:", ldata.toFixed(3));
  })}, 500);

  ambient.setLightTrigger(0.013);
  ambient.on('light-trigger', function(data) {
    console.log("Our light trigger was hit:", data);
    ambient.clearLightTrigger();

    setTimeout(function () {
        ambient.setLightTrigger(0.013);
    }, 300000);

    postSlack();

  });
});

ambient.on('error', function (err) {
  console.log(err)
});


function postSlack() {

  // led1.output(1);

  var data = {
   // "channel":    "#tessel-test",
    "username":   "Aquabot",
    "icon_emoji": ":sweat_drops:",
    "text":       "Refill water cooler!"
  };

  console.log('posting...', data)

  var options = {
    hostname: 'fullstackacademy.slack.com',
    path:     '/services/hooks/incoming-webhook?token=BGgo1erPkILLL4kfN9ERoSXG',
    method:   'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  var req = https.request(options, function(res) {
    led1.output(0);

    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.write( JSON.stringify( data )  );
  req.end();

}
