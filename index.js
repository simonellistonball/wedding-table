var Trello = require("node-trello");
var trello = new Trello('e1076053cd713cbdce8d42f272646da9', '6b34250211a4b10c8436c012c7297d3e1156f556c42ca6e03ac4e2109a3c4dff');
var async = require('async');
var fs = require('fs');

var plan = {}

trello.get('/1/board/53a16765d25de8ad7ea22a99/lists', function (err, results) {
  results = results.filter(function(i){
    return (/^[0-9].*/.test(i.name));
  });
  async.map(results,
    function(i, callback) {
      trello.get('/1/lists/' + i.id + '/cards', function(err, res) {
        callback(err, { table: i.name, members: res.map(function(card){ 
          return card.name;
        })});
      });
    }, 
    function(err, results) {
      fs.writeFile('plan.json', JSON.stringify(results),console.log);
    })
});
