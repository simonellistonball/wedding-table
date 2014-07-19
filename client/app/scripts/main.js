var width = 1280,
    height = 800,
    table_radius = 40,
    person_radius = 10,
    linkDistance = 90,
    charge = -300,
    text_height = 20,
    text_translate_factor = 1/linkDistance * 10,
    include_links = false,
    reset_timeout = 4000;

var color = function(i) {
  // red, light blue, yellow, green, orange, purple, dark blue , white, light green
  var colors = ['#FF1E20','#47A1E8','#FFE700','#41A80B','#FF5E01','#A80278','#55E81D', '#999999','#011BA8'];
  return colors[i];
};

function drawTable(svg, graph, i, x, y) {
    
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

    function cls(d) { return d.cls; } 
    
    var table = svg.selectAll('.atable' + i)
        .data(graph.nodes.filter(function(i) { return i.cls == 'table'; }))
        .enter()
        .append('g').attr('class','atable' + i).attr('transform','translate(' + x + ',' + y + ')');
    
    var tables_data = graph.nodes.filter(function(d) { return d.cls == 'table' });
    /*var tie = svg.selectAll('.tie')
      .data(tables_data)
      .enter()
        .append('line')
          .attr('class','tie')
          .style("stroke-width", '4');
    */
  
  
    if (include_links) {
      var link = table.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", '4');
    }
  
    var node = table.selectAll('.node')
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", node_class)

    node
        .append("use")
        .attr("class", node_class)
        /*.attr("r", function (d) {
            return d.cls == 'table' ? table_radius : person_radius;
        })*/
        .attr("xlink:href",
          function(d) {
            return d.cls == 'table' ? '#baloon' : '#person';
          })
        .attr('transform', function(d) {
          if (d.cls == 'table') {
            return 'scale(0.15) translate(0,-200)';
          } else {
            return 'scale(' + person_radius + ')';
          }
          
        })
        
        .style("fill", function (d) {
            return color(d.group);
        })
        .call(force.drag);
  
    
/*    var bb = { height: 15, width: 100 }
    node.append("rect")
        .attr("class", cls)
        .attr("x", 8) // 5px margin
        .attr("y", 3 - bb.height) // so text is vertically within block
        .attr("width", bb.width + 10) // 5px margin on left + right
        .attr("height", bb.height * 2)
        .attr("fill", "white")
        .attr("fill-opacity", 0.3)
*/  
  
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
      
      if (include_links) {
        link.attr("x1", function (d) { return d.source.x; })
          .attr("y1", function (d) { return d.source.y; })
          .attr("x2", function (d) { return d.target.x; })
          .attr("y2", function (d) { return d.target.y; });
      }
      
      node.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
      
      tb.attr('transform', function(d) {
        //console.log(d, tables_data, graph)
        if (d.cls == table) { 
          return 'translate(0,0)';
        }
        var dx = text_translate_factor * (d.x - width / 6);
        var dy = text_translate_factor * (d.y - height / 6);
        return 'translate(' + dx + ',' + dy + ')';
      });
    });
    }

var random = d3.random.normal(0, 100);

d3.json('plan.json',function(error, data) {  
  var p = 0;
  var position = []
  
  for (var i = 0; i < 9; i++) {
    position.push([i % 3 * width / 3, Math.floor(i/3) * height / 3]);
  }
  
  function swap(arr, a,b) {
    var t = arr[a];
    arr[a] = arr[b];
    arr[b] = t;
  }

  swap(position, 0, 4);
  swap(position, 6, 8);
  
  
  // jitter positions
  position = position.map(function(e,i) {
    return [e[0] + random() / 3, e[1] + random() / 60];
  });
  
  var x = d3.scale.linear()
    .domain([0, width])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([0, height])
    .range([0, height]);

  var zoom = d3.behavior.zoom()
    .x(x)
    .y(y)
    .size([width, height])
    .on("zoom", zoomed);

  
  var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height).call(zoom);

  data.forEach(function(table, i) {
    var graph = { nodes: [], links: [] }
    var table_node = graph.nodes.push({name: '', group: i, cls: 'table', fixed: true, x: width / 6, y: height / 6}) - 1;

    table.members.forEach(function(person) {
      var person_node = graph.nodes.push({ name: person, group: i, cls: 'person'}) - 1;
      graph.links.push({ source: person_node, target: table_node, value: 10 });
    });
    var pos = position[p++ % position.length];
    drawTable(svg, graph, i, x(pos[0]), y(pos[1]));
  });

  function zoomed() {
  }
  
  svg.call(zoom.event);
  
  // now zoom to a table
  function zoomToTable(i, t) {
    console.log('zoomToTable', arguments);
    x
      .domain([0, width/6])
      .range([0, width/6])
    y
      .domain([0, height/6])
      .range([0, height/6]);
    
    setTimeout(resetZoom, reset_timeout);
    
  }
  function resetZoom() {
    x
      .domain([0, width])
      .range([0, width])
    y
      .domain([0, height])
      .range([0, height]);
  }

  function zoomToName(name) {
    // find the table for the name 
    var table = data.find(function(e) { return (e.members.indexOf(name) >= 0);})
    // get the table's index
    return zoomToTable(data.indexOf(table), table);
  }
  
  var socket = io.connect('http://localhost:3000/');
  socket.on('zoom', function(e) {
    zoomToName(e);
  });

});


