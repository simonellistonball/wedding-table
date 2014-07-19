var Trello = require("node-trello");
var trello = new Trello('e1076053cd713cbdce8d42f272646da9', 'a56b549941f00b18d55eb39cffd1ef181f2f9bf68ad8a480a87313619e7c284c');
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
