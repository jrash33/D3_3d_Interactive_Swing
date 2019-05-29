// Define SVG area dimensions
var svgWidth = 2000;
var svgHeight = 1000;

// Define the chart's margins as an object
var chartMargin = {
  top: 30,
  right: 40,
  bottom: 120,
  left: 200
};

// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// var svg = d3.select("#scatter")
//   .append("svg")
//   .attr("height", svgHeight)
//   .attr("width", svgWidth);

var origin = [600, 450], j = 10, scale = 30, beta = 0, alpha = 0, key = function(d){ return d.id; }, startAngle = Math.PI/4;
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


/////////////////////////////////////////////////////////////////////////////////////

var grid3d = d3._3d()
    .shape('GRID', j*2)
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

var point3d = d3._3d()
    .x(function(d){ return d.x; })
    .y(function(d){ return d.y; })
    .z(function(d){ return d.z; })
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

var yScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);


  function processData(data, tt){
    //GRID
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


    //POINTS
    var points = svg.selectAll('circle').data(data[1], key);

    points
    .enter()
    .append('circle')
    .attr('class', '_3d')
    .attr('opacity', 0)
    .attr('cx', posPointX)
    .attr('cy', posPointY)
    .merge(points)
    .transition().duration(tt)
    .attr('r', 2)
    .attr('stroke', 'gray')
    .attr('fill', function(d){ return color(d.id); })
    .attr('opacity', 1)
    .attr('cx', posPointX)
    .attr('cy', posPointY);

    points.exit().remove();

    // Y scale
    var yScale = svg.selectAll('path.yScale').data(data[2]);

    yScale
        .enter()
        .append('path')
        .attr('class', '_3d yScale')
        .merge(yScale)
        .attr('stroke', 'black')
        .attr('stroke-width', .5)
        .attr('d', yScale3d.draw);

    yScale.exit().remove();

    // Y scale text
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
        .text(function(d){ return d[1] <= 0 ? d[1] : ''; });

    yText.exit().remove();

    d3.selectAll('._3d').sort(d3._3d().sort);

}

function posPointX(d){
  return d.projected.x;
}

function posPointY(d){
  return d.projected.y;
}

function init(){

d3.csv("swing_test.csv").then(function(data, key) {
  
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
    .range([-10, 10]);
  var yScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.y),
    d3.max(data, d => d.y) 
    ])
    .range([0, -10]);
  var zScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.z),
    d3.max(data, d => d.z) 
    ])
    .range([-10, 10]);
  
  data.forEach(function(d){
    swing.push({x: xScale(d.x), y: yScale(d.y), z: zScale(d.z), id: 'point_' + cnt++});
  })
  
  // var xLinearScale = d3.scaleLinear()
  //   .domain([-50, 50])
  //   .range([-10, 10]);
  // var yLinearScale = d3.scaleLinear()
  //   .domain([-50, 50])
  //   .range([0, -10]);
  // var zLinearScale = d3.scaleLinear()
  //   .domain([-50, 50])
  //   .range([-10, 10]);

    var cnt = 0;
    xGrid = [], scatter = [], yLine = [];
    for(var z = -j; z < j; z++){
        for(var x = -j; x < j; x++){
            xGrid.push([x, 1, z]);
            //scatter.push({x: x, y: d3.randomUniform(-0, -10)(), z: z, id: 'point_' + cnt++});
            //scatter.push({x: xLinearScale(d3.randomUniform(50, -50)()), y: yLinearScale(d3.randomUniform(-50, 50)()), z: zLinearScale(d3.randomUniform(-50, 50)()), id: 'point_' + cnt++});
        }
    }
    d3.range(-1, 11, 1).forEach(function(d){ yLine.push([-j, -d, -j]); });

    var data = [
        grid3d(xGrid),
        point3d(swing),
        yScale3d([yLine])
    ];
    processData(data, 1000);
  })
}


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
        point3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(scatter),
        yScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([yLine]),
    ];
    processData(data, 0);
}

function dragEnd(){
    mouseX = d3.event.x - mx + mouseX;
    mouseY = d3.event.y - my + mouseY;
}

init();



  

// // Define SVG area dimensions
// var svgWidth = 1000;
// var svgHeight = 500;

// // Define the chart's margins as an object
// var chartMargin = {
//   top: 30,
//   right: 40,
//   bottom: 120,
//   left: 200
// };

// // Define dimensions of the chart area
// var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
// var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// var svg = d3.select("#scatter")
//   .append("svg")
//   .attr("height", svgHeight)
//   .attr("width", svgWidth);
  
// var chartGroup = svg.append("g")
//   .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`)
//   .attr('width', chartWidth)
//   .attr('height', chartHeight)
//   .attr('class', 'main');


// d3.csv("swing_test.csv").then(function(data, key) {
//     //console.log(data)

//     data.forEach(function(data){

//         data.x = +data.x
//         data.y = +data.y
//         data.z = +data.z
//     })

//     // create scales
//     var xLinearScale = d3.scaleLinear()
//         .domain([d3.min(data, d => d.x),
//         d3.max(data, d => d.x) 
//         ])
//         .range([0, chartWidth]);
    
//     // create scales
//     var yLinearScale = d3.scaleLinear()
//         .domain([d3.min(data, d => d.y),
//         d3.max(data, d => d.y)
//         ])
//         .range([chartHeight, 0]);

//     // create scales
//     var zLinearScale = d3.scaleLinear()
//     .domain([d3.min(data, d => d.z),
//     d3.max(data, d => d.z)
//     ])
//     .range([chartHeight, 0]);

//     // Step 3: Create axis functions   
//     var bottomAxis = d3.axisBottom(xLinearScale);
//     var leftAxis = d3.axisLeft(yLinearScale);

//     // Step 4: Append Axes to the chart
//     var xAxis = chartGroup.append("g")
//         .attr("transform", "translate(0, "+ chartHeight +")")
//         .call(bottomAxis)
//     var yAxis = chartGroup.append('g')
//         .call(leftAxis)


//     data.forEach(function(data){
//       console.log([data.x,xLinearScale(data.x)])
//     })
//     console.log(xLinearScale(data.x))
//     var points = svg.selectAll('circle')
//         .data(data, key)
//         .enter()
//         .append('circle')
//         .attr('class', '_3d')
//         .attr('opacity', .9)
//         .attr('cx', d => xLinearScale(d.x))
//         .attr('cy', d => yLinearScale(d.y))
//         .attr('cz', d => zLinearScale(d.z))
//         .attr("r", 2)
//         .attr("fill", "steelblue")

// })


