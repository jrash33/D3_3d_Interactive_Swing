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

var points = svg.selectAll('circle')


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

    
    // var points = svg.selectAll('circle').data(swing, key);

    function pts(p){
      points
        .data([data[1]], key)
        .enter()
        .append('circle')
        .attr('class', '_3d')
        .attr('opacity', 0)
        .attr('cx', p.projected.x)
        .attr('cy', p.projected.y)
        .merge(points)
        .transition().duration(tt)
        .attr('r', 2)
        .attr('stroke', 'gray')
        .attr('fill', function(d){ return color(d.id); })
        .attr('opacity', .9)
        .attr('cx', p.projected.x)
        .attr('cy', p.projected.y);
      points.exit().remove();
    }

    pts(data[1])

    //console.log(data[1])
    d3.selectAll('._3d').sort(d3._3d().sort);
  



    //pts(data[1])

    //APPEND POINTS
    // var points = svg.selectAll('circle').data([data[1]]);
    
    // function pts(p){
    //   points
    //     .enter()
    //     .append('circle')
    //     .attr('class', '_3d')
    //     .attr('r', 5)
    //     .attr('stroke', 'gray')
    //     .attr('fill', function(d){ return color(d.id); })
    //     .attr('opacity', .9)
    //     .attr('cx', p.projected.x)
    //     .attr('cy', p.projected.y);
    //   points.exit().remove();
    // }
    
  
    // //SLIDER BAR
    // const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
    // var data2 = range(0,data[1].length,1);

    // var sliderStep = d3
    //   .sliderBottom()
    //   .min(d3.min(data2))
    //   .max(d3.max(data2))
    //   .width(800)
    //   .ticks(5)
    //   .step(1)
    //   .default(0.015);

    // var gSimple = d3
    //   .select('#slider')
    //   .append('svg')
    //   .attr('width', 1000)
    //   .attr('height', 100)
    //   .append('g')
    //   .attr('transform', 'translate(30,30)')
    //   .call(sliderStep);

    // //GENERATE EVENT LISTENER TO POPULATE PLOT
    // joey = []
    // sliderStep
    //   .on('onchange', val => {
    //     pts(data[1][val])
    //     joey.push(data[1][val])
    //   });

  
}


// function init(data, marker){
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

    // var data = [
    //     grid3d(xGrid),
    //     point3d(swing),
    //     yScale3d([yLine])
    // ];
    


  // moved to here instead of inside process
  //var points = svg.selectAll('circle').data([data[1]]);

  // function pts(p){
  //   points
  //     .enter()
  //     .append('circle')
  //     .attr('class', '_3d')
  //     .attr('r', 5)
  //     .attr('stroke', 'gray')
  //     .attr('fill', function(d){ return color(d.id); })
  //     .attr('opacity', .9)
  //     .attr('cx', p.projected.x)
  //     .attr('cy', p.projected.y);
  //   points.exit().remove();
  // }
  
  // var points = svg.selectAll('circle').data(swing, key);


  //SLIDER BAR
  const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
  var data2 = range(0,swing.length,1);

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

  //GENERATE EVENT LISTENER TO POPULATE PLOT
  sliderStep
    .on('onchange', val => {
      //pts(data[1][val])
      var data = [
        grid3d(xGrid),
        point3d(swing)[val],
        yScale3d([yLine])
      ];
      //console.log('debug')
      //console.log(point3d(swing))

      processData(data, 1000)

    });

  //processData(data, 1000, points);

}


d3.csv("swing_test.csv").then(function(data, key) {
  init(data);
});

//console.log(swing)


// next week: at the end of this function ^ remake the "swing" variable so that dragged function can rotate

function dragStart(){
  mx = d3.event.x;
  my = d3.event.y;
}

function dragged(){

    mouseX = mouseX || 0;
    mouseY = mouseY || 0;
    beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
    alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);
    var data = [
        grid3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(xGrid),
        point3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(swing),
        yScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([yLine]),
    ];
    processData(data, 0);

}

function dragEnd(){
    mouseX = d3.event.x - mx + mouseX;
    mouseY = d3.event.y - my + mouseY;
}







