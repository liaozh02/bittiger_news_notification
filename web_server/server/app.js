var express = require('express')
var path = require('path')
var app = express()
var cors = require('cors')
var bodyParser = require('body-parser');
var index = require('./routes/index');
var auth = require('./routes/auth');

app.use('/static', express.static(path.join(__dirname, '../client/build/static')));

app.use(cors())
app.use(bodyParser.json());

app.use('/', index);
app.use('/auth', auth);


app.listen(3000, function () {
  console.log('app listening on port 3000!')
})