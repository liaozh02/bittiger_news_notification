var mysql = require('mysql')

var connection = mysql.createConnection({
  host: '35.184.66.219',
  user: 'liao',
  password: 'liao',
  database: 'bittiger',
  multipleStatements: true
})


connection.connect(function(err) {
    if (err) throw err;
    console.log('Connected to bittiger database');
})

module.exports = connection