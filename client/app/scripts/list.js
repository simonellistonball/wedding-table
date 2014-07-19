var width = 1280,
  height = 800,
  table_radius = 40,
  person_radius = 10,
  linkDistance = 80,
  charge = -300,
  text_height = 20;



d3.json('plan.json', function (error, data) {
  var p = 0;
  var position = [];
  for (var i = 0; i < 9; i++) {
    position.push([i % 3 * width / 3, Math.floor(i / 3) * height / 3]);
  }

  var merged = []
  merged = merged.concat.apply(merged, data.map(function (i) {
    return i.members;
  }))
  var sorted = merged.sort(function (a, b) {
    if (surname(a) < surname(b)) return -1;
    if (surname(a) > surname(b)) return 1;
    return 0;
  });

  var socket = io.connect(socket_url);

  var list = d3.select('body').select('ul#plan');

  var lis = list.selectAll('li')
    .data(sorted)
    .enter()
    .append('li')


  lis.append('span')
    .attr('class', 'firstname')
    .text(function (d) {
      return firstname(d)
    })
  lis.append('span')
    .attr('class', 'surname')
    .text(function (d) {
      return ' ' + surname(d)
    })


  lis.on('click', function (name) {
    // send socket.io message to zoom to name
    socket.emit('zoom', name)

  });


});