// Define SVG area dimensions
var svgWidth = 2000;
var svgHeight = 1000;

var origin = [800, 450], j = 20, scale = 20, beta = 0, alpha = 0, key = function(d){ return d.id; }, startAngle = Math.PI/4;
var svg    = d3.select('#scatter')
            .append("svg")
            .attr("height", svgHeight)
            .attr("width", svgWidth)
            //.call(d3.drag().on('drag', dragged)
            //.on('start', dragStart)
            //.on('end', dragEnd))
            .append('g');
var color  = d3.scaleOrdinal(d3.schemeCategory20);
var mx, my, mouseX, mouseY;



////////////////////////////////////////////////////////////////////////////////////////
// create grid
var grid3d = d3._3d()
    .shape('GRID', j*2)
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

// create points
var point3d = d3._3d()
    .x(function(d){ return d.x; })
    .y(function(d){ return d.y; })
    .z(function(d){ return d.z; })
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

// create y axis
var yScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);


// function to plot data [input: data object with grid/points/axis parameters]
function processData(data, tt){

    //APPEND GRID
    var xGrid = svg.selectAll('path.grid').data(data[0], key);
        
    xGrid
        .enter()
        .append('path')
        .attr('class','_3d grid')
        .merge(xGrid)
        .attr('stroke','black')
        .attr('stroke-width', 0.1)
        .attr('fill', function(d){ return d.ccw ? 'lightgrey' : '#717171'; })
        .attr('fill-opacity', 0.1)
        .attr('d', grid3d.draw); 
    
    xGrid.exit().remove();





    //test
    test = [data, data, data, data ,data, data, data, data]
    console.log(test)



    ////////////
    // svg
    // .selectAll('circle')
    // .data(data[1], key)
    // .enter()
    // .append('circle')
    // .attr('class', '_3d')
    // .attr('opacity', 0)
    // .attr('r', 2)
    // .attr('stroke', 'gray')
    // .attr('fill', function(d){ return color(d.id); })
    // .attr('opacity', .9)
    // .attr('cx', d => d.projected.x)
    // .attr('cy', d => d.projected.y);

    svg
      .selectAll()
      .data(test)
      .enter()
      .append('g')
      .selectAll()
      .data(function(d){ return d[1]})
      .enter()
      .append('circle')
      .attr('class', '_3d')
      .attr('r', 2)
      .attr('stroke', 'gray')
      .attr('fill', function(d){ return color(d.id); })
      .attr('opacity', .1)
      .attr('cx', d => d.projected.x)
      .attr('cy', d => d.projected.y);


    // APPEND Y AXIS
    var yScale = svg.selectAll('path.yScale').data(data[2]);

    yScale
        .enter()
        .append('path')
        .attr('class', '_3d yScale')
        .merge(yScale)
        .attr('stroke', 'black')
        .attr('stroke-width', .5)
        .attr('tickFormat', 1)
        .attr('d', yScale3d.draw);

    yScale.exit().remove();

    // APPEND TEXT FOR Y AXIS
    var yText = svg.selectAll('text.yText').data(data[2][0]);

    yText
        .enter()
        .append('text')
        .attr('class', '_3d yText')
        .attr('dx', '.3em')
        .merge(yText)
        .each(function(d){
            d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
        })
        .attr('x', function(d){ return d.projected.x; })
        .attr('y', function(d){ return d.projected.y; })
        .style('font', '10px times')
        .text(d => d[1]);

    yText.exit().remove();

    d3.selectAll('._3d').sort(d3._3d().sort);

}


function init(data){
  
  swing = []
  var cnt = 0;
  data.forEach(function(d){
    d.x = +d.x
    d.y = +d.y
    d.z = +d.z
  })
  // create scales
  var xScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.x),
    d3.max(data, d => d.x) 
    ])
    .range([-j, j]);
  var yScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.y),
    d3.max(data, d => d.y) 
    ])
    .range([0, -j]);
  var zScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.z),
    d3.max(data, d => d.z) 
    ])
    .range([-j, j]);
  
  data.forEach(function(d){
    swing.push({x: xScale(d.x), y: yScale(d.y), z: zScale(d.z), id: 'point_' + cnt++});
  })
  
    var cnt = 0;
    xGrid = [], scatter = [], yLine = [];
    for(var z = -j; z < j; z++){
        for(var x = -j; x < j; x++){
            xGrid.push([x, 1, z]);
        }
    }
    d3.range(-1, j+1, 1).forEach(function(d){ yLine.push([-j, -d, -j]); });

    var data = [
        grid3d(xGrid),
        point3d(swing),
        yScale3d([yLine])
    ];
    processData(data, 1000);

}


d3.csv("swing_test.csv").then(function(data, key) {
  console.log(data)

  // // List of groups (here I have one group per column)
  // var allGroup = ["center_face", "grip"]
  // var col = ["x", 'y', 'z', 'xgrip', 'ygrip', 'zgrip']

  // // Reformat the data: we need an array of arrays of {x, y} tuples
  // var dataReady = allGroup.map( function(grpName) { // .map allows to do something for each element of the list
  //   return {
  //     name: grpName,
  //     values: data.map(function(d) {
  //       return {x: d.x, y: d.y, z: d.z};
  //     })
  //   };
  // });
  // // I strongly advise to have a look to dataReady with
  // console.log(dataReady)

  init(data);
});


    // // Add the points
    // svg
    //   // First we need to enter in a group
    //   .selectAll()
    //   .data(dataReady)
    //   .enter()
    //     .append('g')
    //     .style("fill", function(d){ return myColor(d.name) })
    //   // Second we need to enter in the 'values' part of this group
    //   .selectAll()
    //   .data(function(d){ return d.values })
    //   .enter()
    //   .append("circle")
    //     .attr("cx", function(d) { return x(d.time) } )
    //     .attr("cy", function(d) { return y(d.value) } )
    //     .attr("r", 5)
    //     .attr("stroke", "white")