var width = 1400,
  height = 1050,
  linkDistance = 90,
  charge = -10,
  person_radius = 100,
  text_height = 18,
  text_translate_factor = 1 / linkDistance * 10,
  include_links = false,
  reset_timeout = 3000,
  debug = false;

var color = function (i) {
  // red, light blue, yellow, green, orange, purple, dark blue , white, light green
  var colors = ['#FF1E20', '#47A1E8', '#FFE700', '#41A80B', '#FF5E01', '#A80278', '#55E81D', '#666666', '#011BA8'].map(function(c, i) {
    return d3.rgb(c).brighter(0.5);
  });
  console.log(colors);
  return colors[i];
};


function jitterX(){
  return (Math.random() - 0.5) * width / 10;
}
function jitterY(){
  return (Math.random() - 0.5) * (height / 3 - (2 * person_radius + 2 * text_height))
}
d3.json('plan.json', function (err, data) {
  var graph = [];

  data.forEach(function (table, i) {
    // figure out the x and y targets 
    var x = width / 6 + i % 3 * width / 3;
    var y = height / 6 + Math.floor(i / 3) * height / 3;
    // baloon
    var angle_offset = Math.random() * 2 * Math.PI / 16;

    // add jitter
    x += jitterX()
    y += jitterY()
    
    // get the table number
    var group = parseInt(table.table.substr(0, 1)) - 1

    var table_node = graph.push({
      name: '',
      group: group,
      cls: 'table',
      fixed: true,
      x: x,
      y: y,
      children: table.members.map(function (e, i, a) {
        // put round the circle 
        var angle = i / a.length * 2 * Math.PI + angle_offset;
        return {
          name: e,
          cls: 'person',
          angle: angle,
          ux: Math.cos(angle),
          uy: Math.sin(angle)
        }
      })
    }) - 1;

  });

  var sx = d3.scale.linear().domain([0, width]).range([0, width]);
  var sy = d3.scale.linear().domain([0, height]).range([0, height]);

  var coordsToTranslate = function (x, y) {
    return 'translate(' + sx(x) + ',' + sy(y) + ')';
  }

  var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .append('g')

  var node_class = function (d) {
    return "node " + d.cls;
  };

  function cls(d) {
    return d.cls;
  }

  function redraw(t) {
    var wrap = svg.selectAll('.node')
      .data(graph)
      .enter().append("g")
      .attr("class", node_class)

    var node = wrap
      .append('g')
      .attr('transform', function (d) {
        return coordsToTranslate(d.x, d.y)
      })
      .attr('class', 'table')

    /*node.append('animateTransform')
      .attr('attributeName','transform')
      .attr('from', '-100,0')
      .attr('to', '100,0')
      .attr('dur', '2s')
      .attr('repeatCount', "indefinite")
    */

    node
      .append("use")
      .attr("class", node_class)
      .attr("xlink:href", '#baloon')
      .attr('transform', function (d) {
        return 'scale(0.15) translate(-160,-240)';
      })
      .style("fill", function (d) {
        return color(d.group);
      })
    node.append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', sy(45))
      .attr('y2', sy(height))
      .attr('class', 'tie')
      .attr('stroke-width', 4)

    var people = node.append('g');

    var person = people.selectAll('person')
      .data(function (d) {
        return d.children
      })
      .enter()
      .append('g')
      .attr('class', 'person')
      .attr('transform', function (d) {
        return coordsToTranslate(person_radius * d.ux, person_radius * d.uy)
        //return coordsToTranslate(person_radius * Math.sin(d.angle + Math.PI * 2 * t/200), person_radius * Math.cos(d.angle + Math.PI * 2 * t/200))
      });


    if (debug) {
      node.append('circle')
        .attr('cx', '0')
        .attr('cy', '0')
        .attr('r', '10')
        .attr('style', 'fill: red')
      person.append('circle')
        .attr('cx', '0')
        .attr('cy', '0')
        .attr('r', '10').attr('style', 'fill: red')
    }

    var textPosition = function (y) {
      return function (d) {
        var l = surname(d.name).length;
        var x = 0;
        if (d.ux < 0) {
          x = -l * 5;
        }
        return coordsToTranslate(x, y)
      }
    }

    var tb = person
      .append('g')
      .attr('class', 'text')

    var first = tb.append("text")
      .text(function (d) {
        return firstname(d.name)
      })
    var sur = tb.append("text")
      .attr('class', 'surname')
      .attr('transform', coordsToTranslate(0, text_height))
      .text(function (d) {
        return surname(d.name);
      })

    // get the length of the tb and move it a bit

    sur.each(function(d) {
      var bb = this.getBBox();
      this.parentElement.setAttribute('transform', 'translate(' + (d.ux > 0 ? 0 : -bb.width / 2) + ',0)');
    })
    

    function animateStart() {
      wrap
        .attr('transform', 'translate(0,' + height + ')')
        .transition()
        .delay(500)
        .duration(function(d){ return 500 + Math.random() * 1500 })
        .attr('transform', 'translate(0,0)')
        .transition()
        .delay(13000)
        .duration(function(d){ return 500 + Math.random() * 1500 })
        .attr('transform', 'translate(0,-height)')
    }

    setTimeout(animateStart, 20000);
    animateStart()

  }
  var t = 0;

  d3.timer(function () {
    redraw(++t % 100)
  })
  redraw(0);

  // now zoom to a table
  function zoomToTable(i, t) {
    console.log('zoomToTable', arguments);

    setTimeout(resetZoom, reset_timeout);

    var x = graph[i].x,
      y = graph[i].y,
      k = 2.5;
    
    x += jitterX()
    y += jitterY();

    svg.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")

  }

  function resetZoom() {
    svg.transition()
      .duration(750)
      .attr("transform", "translate(0,0)scale(1,1)")
  }

  function zoomToName(name) {
    // find the table for the name 
    var table = data.find(function (e) {
      return (e.members.indexOf(name) >= 0);
    })
    // get the table's index
    return zoomToTable(data.indexOf(table), table);
  }

  var socket = io.connect('http://localhost:3000/');
  socket.on('zoom', function (e) {
    zoomToName(e);
  });


});