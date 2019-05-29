// Define SVG area dimensions
var svgWidth = 2000;
var svgHeight = 1000;

var origin = [800, 450], j = 20, scale = 20, beta = 0, alpha = 0, key = function(d){ return d.id; }, startAngle = Math.PI/4;
var svg    = d3.select('#scatter')
            .append("svg")
            .attr("height", svgHeight)
            .attr("width", svgWidth)
            .call(d3.drag().on('drag', dragged)
            .on('start', dragStart)
            .on('end', dragEnd))
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




///////////////////////////////////////////////////////////////////////////////////////    
// function to plot data [input: data object with grid/points/axis parameters]
function processData(data, tt){

    //APPEND GRID
    var xGrid = svg.selectAll('path.grid').data(data[0][0], key);
        
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
    test = [data[0], data[1]];

    // points = svg
    //           .selectAll()
    //           .data(test)
    //           .enter()
    //           //.append('g')
    //           .selectAll('circle')
    //           .data(function(d){return d[1]});

    // points
    //   .enter()
    //   .append('circle')
    //   .attr('class', '_3d')
    //     //transition effect
    //     // .attr('opacity', 0)
    //     // .attr('cx', d => d.projected.x)
    //     // .attr('cy', d => d.projected.y)
    //     .merge(points)
    //     // .transition().duration(tt)
    //   .attr('r', 2)
    //   .attr('stroke', 'gray')
    //   .attr('fill', function(d){ return color(d.id); })
    //   .attr('opacity', .9)
    //   .attr('cx', d => d.projected.x)
    //   .attr('cy', d => d.projected.y);

    // points.exit().remove();

    //LINE ARRAY
    array1=[]
    array2=[]

    data[0][1].forEach(function(d){
      array1.push(d.projected)
    })

    data[1][1].forEach(function(d){
      array2.push(d.projected)
    })
    
    //cross combine
    line_array = []
    for (i=0; i<array1.length; i++){
      line_array.push(array1[i])
      line_array.push(array2[i])
    }
    
  

    var line_updated = d3.line()
      .x(d => d.x)
      .y(d => d.y)


    points = svg.selectAll().data(test);

    lines = svg.selectAll("myLines").data(test);


    lines
      .enter()
      //.append("g")
      //.selectAll()
      .append("path")
        .attr("d", line_updated(line_array))
        .attr("stroke", "darkred")
        .attr('fill', 'none')
        .attr('opacity', .3)
        .style('stroke-width', 1);
    lines.exit().remove();


    

    points = svg
      .selectAll()
      .data(test)
      .enter()
      .append('g')
      .selectAll('circle')
      .data(function(d){return d[1]});

    points
      .enter()
      .append('circle')
      .attr('class', '_3d')
        //transition effect
        // .attr('opacity', 0)
        // .attr('cx', d => d.projected.x)
        // .attr('cy', d => d.projected.y)
        //.merge(points)
        // .transition().duration(tt)
      .attr('r', 2)
      .attr('stroke', 'gray')
      .attr('fill', function(d){ return color(d.id); })
      .attr('opacity', .9)
      .attr('cx', d => d.projected.x)
      .attr('cy', d => d.projected.y);


    points.exit().remove();


    // points
    //   .enter()
    //   .append('g')
    //   .selectAll('circle')
    //   .data(function(d){ return d[1]})
    //   .enter()
    //   .append('circle')
    //   //.attr('class', '_3d')
    //     // //transition effect
    //     // .attr('opacity', 0)
    //     // .attr('cx', d => d.projected.x)
    //     // .attr('cy', d => d.projected.y)
    //     //.merge(points)
    //     //.transition().duration(tt)
    //   .attr('r', 2)
    //   .attr('stroke', 'gray')
    //   //.attr('fill', function(d){ return color(d.id); })
    //   .attr('opacity', .9)
    //   .attr('cx', d => d.projected.x)
    //   .attr('cy', d => d.projected.y)


    // points.exit().remove();

    // APPEND Y AXIS
    var yScale = svg.selectAll('path.yScale').data(data[0][2]);

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
    var yText = svg.selectAll('text.yText').data(data[0][2][0]);

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

///////////////////////////////////////////////////////////////////////////////////////

function init(data){
  
  swing = []
  var cnt = 0;

  // create scales based off of only one marker set (default: center_face)
  var xScale = d3.scaleLinear()
    .domain([d3.min(data[0], d => d.x),
    d3.max(data[0], d => d.x) 
    ])
    .range([-j, j]);

  var yScale = d3.scaleLinear()
    .domain([d3.min(data[0], d => d.y),
    d3.max(data[0], d => d.y) 
    ])
    .range([0, -j]);

  var zScale = d3.scaleLinear()
    .domain([d3.min(data[0], d => d.z),
    d3.max(data[0], d => d.z) 
    ])
    .range([-j, j]);
  
  data.map(function(d){
    marker = []
    d.map(function(d){
      marker.push({x: xScale(d.x), y: yScale(d.y), z: zScale(d.z), id: 'point_' + cnt++});
    })
    swing.push(marker);
  })
  
  // create 20x20 grid
    var cnt = 0;
    xGrid = [], scatter = [], yLine = [];
    for(var z = -j; z < j; z++){
        for(var x = -j; x < j; x++){
            xGrid.push([x, 1, z]);
        }
    }

    //y axis line
    d3.range(-1, j+1, 1).forEach(function(d){ yLine.push([-j, -d, -j]); });

    // format data to be plotted in processData function
    var data_all = [];

    swing.forEach(function(d){
      var data = [
        grid3d(xGrid),
        point3d(d),
        yScale3d([yLine])
      ];
      data_all.push(data);
    })

    //ready to be plotted
    processData(data_all, 1000);

}


///////////////////////////////////////////////////////////////////////////////////////
//MAIN
d3.csv("swing_test.csv").then(function(data, key) {

  //generate slider bar values
  const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
  //var data2 = range(0,data.length,1);
  var data2 = range(0,data.length,1);

  var sliderStep = d3
      .sliderBottom()
      .min(d3.min(data2))
      .max(d3.max(data2))
      .width(800)
      .ticks(5)
      .step(1)
      .default(0.015);

  var gSimple = d3
      .select('#slider')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(30,30)')
      .call(sliderStep);
  
  //get column names for easy formatting
  var columns = data.columns;
 
  //slice data and prepare
  var center_face = []
  var grip = []

  data.map(function(d){
  center_face.push({
    "x" : +d[columns[0]],
    "y": +d[columns[1]],
    "z": +d[columns[2]],
    })
  grip.push({
    "x": +d[columns[3]],
    "y": +d[columns[4]],
    "z": +d[columns[5]]
  })
  });

  var all_markers = [center_face, grip]

  init(all_markers);

  //slider to change markers shown
  sliderStep
      .on('onchange', val => {
          d3.csv("swing_test.csv").then(function(data, key) {

              //refresh data points/lines
              d3.selectAll("circle").remove();
              d3.selectAll("path").remove();
              
              please_work = data.slice(val)

              //slice data and prepare
              //make function for this later
              var center_face = []
              var grip = []

              please_work.map(function(d){
              center_face.push({
                "x" : +d[columns[0]],
                "y": +d[columns[1]],
                "z": +d[columns[2]],
                })
              grip.push({
                "x": +d[columns[3]],
                "y": +d[columns[4]],
                "z": +d[columns[5]]
              })
              })

              var please = [center_face, grip]

              init(please);
          });
      });





});


///////////////////////////////////////////////////////////////////////////////////////
//drag functions
function dragStart(){
  mx = d3.event.x;
  my = d3.event.y;
}

function dragged(){
    d3.selectAll("circle").remove();
    d3.selectAll("path").remove();
    
    mouseX = mouseX || 0;
    mouseY = mouseY || 0;
    beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
    alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);

    var data_drag = []
    swing.forEach(function(d){
      data_drag.push([
        grid3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(xGrid),
        point3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(d),
        yScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([yLine]),
      ])  
    })
    processData(data_drag, 0);
    
}

function dragEnd(){
    mouseX = d3.event.x - mx + mouseX;
    mouseY = d3.event.y - my + mouseY;
}