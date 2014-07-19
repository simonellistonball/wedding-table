var width = 1280,
  height = 800,
  linkDistance = 90,
  charge = -10,
  person_radius = 10,
  text_height = 20,
  text_translate_factor = 1 / linkDistance * 10,
  include_links = false,
  reset_timeout = 4000;

var color = function (i) {
  // red, light blue, yellow, green, orange, purple, dark blue , white, light green
  var colors = ['#FF1E20', '#47A1E8', '#FFE700', '#41A80B', '#FF5E01', '#A80278', '#55E81D', '#999999', '#011BA8'];
  return colors[i];
};



d3.json('plan.json', function (err, data) {
  var graph = {
    nodes: [],
    links: []
  }
  data.forEach(function (table, i) {

    // figure out the x and y targets 
    var x = i % 3 * width / 3 + Math.random() * width / 9;
    var y = (i - i % 3) / 3 * height / 3 + height / 6 + Math.random() * height / 12;
    // ground node 
    var ground = graph.nodes.push({
      name: '',
      group: i,
      cls: 'ground',
      fixed: true,
      x: x,
      y: height
    }) - 1;
    // baloon
    var table_node = graph.nodes.push({
      name: '',
      group: i,
      cls: 'table',
      fixed: true,
      x: x,
      y: y
    }) - 1;
    // link to the ground 
    graph.links.push({
      source: ground,
      target: table_node,
      value: 1
    });

    table.members.forEach(function (person) {
      var person_node = graph.nodes.push({
        name: person,
        group: i,
        cls: 'person'
      }) - 1;
      graph.links.push({
        source: person_node,
        target: table_node,
        value: 10
      });
    });
  });

  var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)

  var force = d3.layout.force()
    .charge(charge)
    .linkDistance(linkDistance)
    .size([width / 3, height / 3])
    .gravity(0);

  force
    .nodes(graph.nodes)
    .links(graph.links)
    .start();

  var node_class = function (d) {
    return "node " + d.cls;
  };

  function cls(d) {
    return d.cls;
  }

  var node = svg.selectAll('.node')
    .data(graph.nodes)
    .enter().append("g")
    .attr("class", node_class)

  node
    .append("use")
    .attr("class", node_class)
    .attr("xlink:href",
      function (d) {
        return d.cls == 'table' ? '#baloon' : '#person';
      })
    .attr('transform', function (d) {
      if (d.cls == 'table') {
        return 'scale(0.15) translate(-170,-550)';
      } else {
        return 'scale(' + person_radius + ')';
      }

    })
    .style("fill", function (d) {
      return color(d.group);
    })
    .call(force.drag);
  
  var link = svg.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "link")
    .style("stroke-width", '4');
  var tb = node
    .append('g')
    .attr('class', 'text')


  tb.append("text")
    .attr('transform', 'translate(8, 0)')
    .text(function (d) {
      return firstname(d.name)
    });
  tb.append("text")
    .attr('class', 'surname')
    .attr('transform', 'translate(8, ' + text_height + ')')
    .text(function (d) {
      return surname(d.name);
    });


  force.on("tick", function () {
    link.attr("x1", function (d) {
      return d.source.x;
    })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    node.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

    /*    tb.attr('transform', function(d) {
        //console.log(d, tables_data, graph)
        if (d.cls == table) { 
          return 'translate(0,0)';
        }
        var dx = text_translate_factor * (d.x - width / 6);
        var dy = text_translate_factor * (d.y - height / 6);
        return 'translate(' + dx + ',' + dy + ')';
      });*/
  });


});