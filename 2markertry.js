// Define SVG area dimensions
var svgWidth = 2000;
var svgHeight = 1000;

var origin = [800, 500], j = 20, scale = 20, beta = 0, alpha = 0, key = function(d){ return d.id; }, startAngle = Math.PI/4;
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


//function for plotting full golf swing with all markers
function plot_swing(data, color_code){
  
  //test list to hold each marker
  test = [data[0], data[1], data[2], data[3], data[4], data[5]];

  //LINE ARRAYS
  center_face_array=[]
  grip_array=[]
  hosel_center_array=[]
  Lframe_face_array=[]
  Lframe_loft_array=[]

  //center_face
  data[0][1].forEach(function(d){
    center_face_array.push(d.projected)
  })

  //grip
  data[1][1].forEach(function(d){
    grip_array.push(d.projected)
  })

  //hosel_center
  data[2][1].forEach(function(d){
    hosel_center_array.push(d.projected)
  })

  //Lframe_face
  data[3][1].forEach(function(d){
    Lframe_face_array.push(d.projected)
  })

  //Lframe_loft
  data[4][1].forEach(function(d){
    Lframe_loft_array.push(d.projected)
  })

  //cross combine in order of lines you want to connect
  line_array = []
  line_array2 = []
  for (i=0; i<hosel_center_array.length; i++){
    line_array.push(grip_array[i])
    line_array.push(hosel_center_array[i])
    line_array2.push(center_face_array[i])
    line_array2.push(Lframe_face_array[i])
    line_array2.push(Lframe_loft_array[i])
    line_array2.push(center_face_array[i])
  }
    
  var line_updated = d3.line()
    .x(d => d.x)
    .y(d => d.y)


  //color codes for multiple swings
  if (color_code == 0){
    var shaft_color = 'darkred'
    var face_color = 'blue'
  }
  else if (color_code == 1){
    var shaft_color = 'grey'
    var face_color = 'green'
  }
  
  //plot lines
  lines = svg.selectAll("myLines")

  lines
    .data(test)
    .enter()
    .append("path")
    .attr('id', 'lines')
      .attr("d", line_updated(line_array))
      .attr("stroke", shaft_color)
      .attr('fill', 'none')
      .attr('opacity', .3)
      .style('stroke-width', 1);
      
  lines
    .data(test)
    .enter()
    .append("path")
    .attr('id','lines')
      .attr("d", line_updated(line_array2))
      .attr("stroke", face_color)
      .attr('fill', face_color)
      .attr('fill-opacity', .1)
      .attr('opacity', .3)
      .style('stroke-width', 1);


   //scatter plot of markers
   points = svg
      .selectAll('swing1')
      .data(test)
      .enter()
      .append('g')
      .selectAll('circle')
      .data(function(d){return d[1]});

    points
      .enter()
      .append('circle')
      .attr('class', 'swing1')
      .attr('r', 2)
      .attr('stroke', 'gray')
      .attr('opacity', .9)
      .attr('cx', d => d.projected.x)
      .attr('cy', d => d.projected.y)



    points.exit().remove();
  
}



///////////////////////////////////////////////////////////////////////////////////////    
// function to plot data [input: data object with grid/points/axis parameters]
function processData(data, tt){


    //APPEND GRID using first swing
    var xGrid = svg.selectAll('path.grid').data(data[0][2][0], key);
        
    //append grid to page
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


    //plot swings
    var count = 0;
    data.forEach(function(d){
      plot_swing(d, count);
      count += 1;
    })


    // APPEND Y AXIS
    var yScale = svg.selectAll('path.yScale').data(data[0][0][2]);

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
    var yText = svg.selectAll('text.yText').data(data[0][0][2][0]);

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

function init(data, type_swing){

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


  //SWINGS
  var cnt = 0;

  // create scales based off of first swing (default: center_face)
  // note: advise using largest x/y dimension swing as first in list
  var xScale = d3.scaleLinear()
    .domain([d3.min(data[0][data[0].length-1], d => d.x),
    d3.max(data[0][data[0].length-1], d => d.x) 
    ])
    .range([-j, j]);

  var yScale = d3.scaleLinear()
    .domain([d3.min(data[0][data[0].length-1], d => d.y),
    d3.max(data[0][data[0].length-1], d => d.y) 
    ])
    .range([0, -j]);

  var zScale = d3.scaleLinear()
    .domain([d3.min(data[0][data[0].length-1], d => d.z),
    d3.max(data[0][data[0].length-1], d => d.z) 
    ])
    .range([-j, j]);
  


  //************* look at sections of the swing at a time ******************  
  if (type_swing == 1){

    //will hold the swing coordinates for drag rotation function later
    all_swings = []
    //plot parameters to be passed to processData function
    data_all = []

    //loop through each swing
    data.forEach(function(data_ind){
      
      //holds new scaled swing coordinates
      swing = []

      data_ind.map(function(d){
      marker = []
      d.map(function(d){
        //push new scaled coordinates to marker
        marker.push({x: xScale(d.x), y: yScale(d.y), z: zScale(d.z), id: 'point_' + cnt++});
        });
        //push again to swing list to separate swings
        swing.push(marker);
      })
      
      //push to var all_swings for drag function
      all_swings.push(swing)

      var data1 = [];
      //format data for plot function
      swing.forEach(function(d){
        var data = [
          grid3d(xGrid),
          point3d(d),
          yScale3d([yLine])
        ];
        data1.push(data);
      })

      //push complete formatted swing to list to hold all completed swings
      data_all.push(data1)
    })
  }


  //*********** individual swing sequence *********************************
  else if (type_swing == 0){

    //will hold the swing coordinates for drag rotation function later
    all_swings = []
    //plot parameters to be passed to processData function
    data_all = []
    var t;

    //loop through each swing
    data.forEach(function(data_ind){
      //holds new scaled swing coordinates
      swing = []

      for (t = 0; t<data_ind.length; t++){
        var marker = [];
        if (t == data_ind.length-1){
            data_ind[t].map(function(d){
            //push new scaled coordinates to marker
            marker.push({x: xScale(d.x), y: yScale(d.y), z: zScale(d.z), id: 'point_' + cnt++});
          })
          swing.push(marker)
        }
        else{
          //push new scaled coordinates to marker
          marker.push({x: xScale(data_ind[t].x), y: yScale(data_ind[t].y), z: zScale(data_ind[t].z), id: 'point_0'});
          swing.push(marker)
        }
       }
       
      //push to var all_swings for drag function
      all_swings.push(swing)

      var data1 = [];

      //format data for plot function
      swing.forEach(function(d){
        var data = [
          grid3d(xGrid),
          point3d(d),
          yScale3d([yLine])
        ];
        data1.push(data);
      })

      //push complete formatted swing to list to hold all completed swings
      data_all.push(data1)

    });
  
  }

  //feed all completed and formatted swings to plot function
  processData(data_all, 1000);

}


///////////////////////////////////////////////////////////////////////////////////////
//MAIN

//swing csv files
var swing_csv1 = 'swing_test.csv'
var swing_csv2 = 'swing_test2.csv'

Promise.all([
  d3.csv(swing_csv1),
  d3.csv(swing_csv2)
]).then(function joey(data, key) {
  
  //start screen to show all data
  default_start = init_range(data[0], 0, 0)
  default_start2 = init_range(data[1], 0, 0)

  default_start_all = [default_start, default_start2]
  default_start_all = [default_start]
  
  init(default_start_all, 1)

  data[0].name = 'Swing 1'
  data[1].name = 'Swing 2'
  //BUTTON//////////////////////////////////////////////////
  const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
  var data2 = range(0,data[0].length,1);
  
  //append slide bar to page with given parameters
  var sliderStep = d3
      .sliderBottom()
      .min(d3.min(data2))
      .max(d3.max(data2))
      .width(800)
      .ticks(5)
      .step(1)
      .default(10)
      .fill('#2196f3');

  var gSimple = d3
      .select('#slider')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(30,30)')
      .call(sliderStep);

  //hide for now
  d3
    .select('#slider')
    .style('visibility', 'hidden')

    var sliderRange=[];
    var sliderRange = d3
      .sliderBottom()
      .min(d3.min(data2))
      .max(d3.max(data2))
      .width(800)
      .ticks(5)
      .default([0, d3.max(data2)])
      .step(1)
      .fill('#2196f3')

    var gRange = d3
      .select('#newRange')
      .append('svg')
      .attr('id', 'range')
      .attr('width', 1000)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(30,30)')
      .call(sliderRange);

  //hide for now
  d3
    .select('#newRange')
    .style('visibility', 'hidden')
 
  d3
    .selectAll("#sequence")
    .attr('checked', true)
    .on("change", work); 

  function work(){
    if (this.value=='ind_swing'){

      //refresh data points/lines
      //d3.selectAll("#range").remove();
      d3
        .select('#newRange')
        .style('visibility', 'hidden')

      d3
        .select('#slider')
        .style('visibility', 'visible')

      idk(sliderStep, 0);
    
    }
    else if (this.value=='range_swing'){
      d3
      .select('#slider')
      .style('visibility', 'hidden')
      
      d3
      .select('#newRange')
      .style('visibility', 'visible')


      idk(sliderRange, 1);

      } 

  }


function idk(sliderRange, val){

  //refresh checkboxes
  d3.selectAll("label").remove();

  names = ['Swing 1', 'Swing 2']
  d3
    .select("#test")
    .selectAll("input")
    //.data(['Swing 1', 'Swing 2'])
    .data(data)
    .enter()
    .append('label')
      //.text(function(d) { return d; })
      .text(function(d) { return d.name; })
    .append("input")
        .attr("type", "checkbox")
        .attr('id', 'please_work')
        .on("change", update
        );
  

  function update(){
    var default_range = sliderRange.value()
    //console.log(default_range)

    var default_indiv = sliderStep.value()
    console.log(default_indiv)

    //refresh data points/lines
    d3.selectAll("path").attr('id','lines').remove();
    d3.selectAll("circle").remove();

    var choices = [];
    d3
    .selectAll("#please_work")
    .each(function(d){
      cb = d3.select(this);
      //console.log(cb.property)
      if(cb.property("checked")){
        //console.log(cb._groups[0][0].__data__.name)
        choices.push(cb._groups[0][0].__data__);
      }
    });
       
    if (val == 1){
    //call function to slice/clean/format data
    default_start_all = [];
    choices.forEach(function(d){
      default_start = init_range(d, default_range, 1)
      default_start_all.push(default_start)
    })

    //pass to scaling/plot format function
    init(default_start_all, 1);

    
    //generate event on change
    sliderRange
      .on('onchange', val => {
        Promise.all([
          d3.csv(swing_csv1),
          d3.csv(swing_csv2)
        ]).then(function(data, key) {

          //refresh data points/lines
          d3.selectAll("path").attr('id','lines').remove();
          d3.selectAll("circle").remove();

          var choices = [];
          d3
          .selectAll("#please_work")
          .each(function(d){
            cb = d3.select(this);
            //console.log(cb.property)
            if(cb.property("checked")){
              //console.log(cb._groups[0][0].__data__.name)
              choices.push(cb._groups[0][0].__data__);
            }
          });
        
        //call function to slice/clean/format data
        default_start_all = [];
        choices.forEach(function(d){
          default_start = init_range(d, val, 1)
          default_start_all.push(default_start)
        })

        //pass to scaling/plot format function
        init(default_start_all, 1);
      });
      
    });
  }

  if (val == 0 ){
    //call function to slice/clean/format data
    default_start_all = [];
    choices.forEach(function(d){
      default_start = init_data_single(d, default_indiv)
      default_start_all.push(default_start)
    })

    console.log(default_start_all)
    //pass to scaling/plot format function
    init(default_start_all, 0);

    //slider to change markers shown
    sliderStep
      .on('onchange', val => {
          Promise.all([
            d3.csv(swing_csv1),
            d3.csv(swing_csv2)
          ]).then(function(data, key) {

            //refresh data points/lines
            d3.selectAll("path").attr('id','lines').remove();
            d3.selectAll("circle").remove();

            var choices = [];
            d3
            .selectAll("#please_work")
            .each(function(d){
              cb = d3.select(this);
              //console.log(cb.property)
              if(cb.property("checked")){
                //console.log(cb._groups[0][0].__data__.name)
                choices.push(cb._groups[0][0].__data__);
              }
            });
            
            //call function to slice/clean/format data
            default_start_all = [];
            choices.forEach(function(d){
              default_start = init_data_single(d, val)
              default_start_all.push(default_start)
            })

            //pass to scaling/plot format function
            init(default_start_all, 0);
          });
      });

  }

  }
}


  //SIMPLE SLIDER BAR///////////////////////////////
  //generate slider bar values
  // const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
  // var data2 = range(0,data[0].length,1);
  
  // //append slide bar to page with given parameters
  // var sliderStep = d3
  //     .sliderBottom()
  //     .min(d3.min(data2))
  //     .max(d3.max(data2))
  //     .width(800)
  //     .ticks(5)
  //     .step(1)
  //     .default(0)
  //     .fill('#2196f3');

  // var gSimple = d3
  //     .select('#slider')
  //     .append('svg')
  //     .attr('width', 1000)
  //     .attr('height', 100)
  //     .append('g')
  //     .attr('transform', 'translate(30,30)')
  //     .call(sliderStep);
  
  // //slider to change markers shown
  // sliderStep
  //     .on('onchange', val => {
  //         Promise.all([
  //           d3.csv(swing_csv1),
  //           d3.csv(swing_csv2)
  //         ]).then(function(data, key) {

  //             //refresh data points/lines
  //             d3.selectAll("path").attr('id','lines').remove();
  //             d3.selectAll("circle").remove();
              
  //             //call function to slice/clean/format data
  //             please = init_data_single(data[0], val)
  //             please2 = init_data_single(data[1], val)

  //             //combine into 1 list
  //             please_work = [please, please2]
              
  //             //pass to scaling/plot format function
  //             init(please_work, 0);
  //         });
  //     });


//RANGE SLIDER BAR////////////////////////////////

//append new range slider bar to page with given parameters
// var sliderRange = d3
//   .sliderBottom()
//   .min(d3.min(data2))
//   .max(d3.max(data2))
//   .width(800)
//   .ticks(5)
//   .default([0, d3.max(data2)])
//   .step(1)
//   .fill('#2196f3')

// var gRange = d3
//   .select('#range')
//   .append('svg')
//   .attr('width', 1000)
//   .attr('height', 100)
//   .append('g')
//   .attr('transform', 'translate(30,30)')
//   .call(sliderRange);

// //generate event on change
// sliderRange
//   .on('onchange', val => {
//     Promise.all([
//       d3.csv(swing_csv1),
//       d3.csv(swing_csv2)
//     ]).then(function(data, key) {

//       //refresh data points/lines
//       d3.selectAll("path").attr('id','lines').remove();
//       d3.selectAll("circle").remove();
      
//       //call function to slice/clean/format data
//       please1 = init_range(data[0], val, 1)
//       please2 = init_range(data[1], val, 1)

//       //combine into 1 list
//       please_work = [please1, please2]

//       //pass to scaling/plot format function
//       init(please_work, 1);
//     });
//   });
});


//function to prepare individual swing sequence data for init
function init_data_single(data, slice_val){

  //get columns
  var columns = data.columns;

  //slice the data with slider bar value
  marker = data[slice_val]
  
  //rename and change data type from string
  var center_face = {"x": +marker.xCenterFace, "y": +marker.yCenterFace, "z": +marker.zCenterFace};
  var grip = {"x": +marker.xGripTop, "y": +marker.yGripTop, "z": +marker.zGripTop};
  var hosel_center = {"x": +marker.xHoselCenter, "y": +marker.yHoselCenter, "z": +marker.zHoselCenter};
  var Lframe_face = {"x": +marker.xLFrameFace, "y": +marker.yLFrameFace, "z": +marker.zLFrameFace};
  var Lframe_loft = {"x": +marker.xLFrameLoft, "y": +marker.yLFrameLoft, "z": +marker.zLFrameLoft};
  
  //last spot reserved for full hoselcenter swing
  var center_face_original = [];
  data.map(function(d){
    center_face_original.push({
      "x" : +d.xHoselCenter,
      "y": +d.yHoselCenter,
      "z": +d.zHoselCenter,
      })
  })

  //all prepped and formatted markers to be plotted
  var all_markers = [center_face, grip, hosel_center, Lframe_face, Lframe_loft, center_face_original]

  return(all_markers)
}


//function to prepare range swing sequence data for init
function init_range(data, slice_val, slider_val){
    
  //get columns
  var columns = data.columns;

  //default slice: use all and don't slice
  if (slider_val == 0){
  please_work = data}

  //range slider slice
  else if(slider_val == 1){
  please_work = data.slice(slice_val[0], slice_val[1])
  }
  
  //rename and and save each marker from csv as xyz coordinates to be plotted
  var center_face_original = []
  var center_face = []
  var grip = []
  var Lframe_face = []
  var Lframe_loft = []
  var hosel_center = []

  data.map(function(d){
    center_face_original.push({
      "x" : +d.xHoselCenter,
      "y": +d.yHoselCenter,
      "z": +d.zHoselCenter,
      })
  })

  please_work.map(function(d){
    center_face.push({
      "x" : +d.xCenterFace,
      "y": +d.yCenterFace,
      "z": +d.zCenterFace,
      })
    grip.push({
      "x": +d.xGripTop,
      "y": +d.yGripTop,
      "z": +d.zGripTop
    })
    hosel_center.push({
      "x": +d.xHoselCenter,
      "y": +d.yHoselCenter,
      "z": +d.zHoselCenter
    })
    Lframe_face.push({
      "x": +d.xLFrameFace,
      "y": +d.yLFrameFace,
      "z": +d.zLFrameFace
    })
    Lframe_loft.push({
      "x": +d.xLFrameLoft,
      "y": +d.yLFrameLoft,
      "z": +d.zLFrameLoft
    })
    })

  //all prepped and formatted markers
  var all_markers = [center_face, grip, hosel_center, Lframe_face, Lframe_loft, center_face_original]

  return(all_markers)
}


///////////////////////////////////////////////////////////////////////////////////////
//drag functions
function dragStart(){
  mx = d3.event.x;
  my = d3.event.y;
}

function dragged(){

    //clear previous plot
    d3.selectAll("circle").remove();
    d3.selectAll("path").attr('id','lines').remove();
    
    //rotation functions
    mouseX = mouseX || 0;
    mouseY = mouseY || 0;
    beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
    alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);

    //apply rotation to current 3d scatter
    data_drag = []
    all_swings.forEach(function(x){    
      var data_drag_ind = []
      x.forEach(function(d){
        data_drag_ind.push([
          grid3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(xGrid),
          point3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(d),
          yScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([yLine]),
        ])  
      })
      data_drag.push(data_drag_ind)
    });

    //push new coordinates to plot function
    processData(data_drag, 0);
    
}

function dragEnd(){
    mouseX = d3.event.x - mx + mouseX;
    mouseY = d3.event.y - my + mouseY;
}