const history = require('connect-history-api-fallback');
const express = require('express');

const app = express();
app.use(history());

app.use(express.static(__dirname + '/public/'));

const port = '8081';
const host = 'localhost';

var server = app.listen(port, host, function() {
  console.log('Listening at http://%s:%s', server.address().address, server.address().port);
});