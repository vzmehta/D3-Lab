$(document).ready(function() {

  // globally available car data
  var carData = [];
  var svg
  var w = 400,
    h = 300,
    pad = 20,
    left_pad = 100;



  // grab data from csv file
  $.ajax({
    type: "GET",
    url: "car.csv",
    dataType: "text",
    success: function(data) {
      processData(data);  // parse and push data to global variable carData
      var plotData = filterData();   // grab data from fields and filter global field
      updatePlot(plotData);
    }
  });

  $('#update').click(function() {
    var plotData = filterData();   // grab data from fields and filter global field
    updatePlot(plotData);
  });

  function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var tarr = {};

    // update drow down with titles
    listSelect(headers);

    for (var i=1; i<allTextLines.length; i++) {
      var data = allTextLines[i].split(',');
      tarr = {};
      for (var j=0; j<headers.length; j++) {
        tarr[headers[j]] = data[j]
      }
      carData.push(tarr);
    }
  }

  function filterData() {
    var sel_x = $('#sel-x').val();
    var sel_y = $('#sel-y').val();

    var plotData = carData.map(function(d) {
      return {
        x: d[sel_x],
        y: d[sel_y]
      }
    });

    plotData = plotData.filter(function(d) {
      var min = $('#min').val();
      var max = $('#max').val();
      return (d.x > min && d.x < max)
    });

    return plotData;
  }

  function listSelect(headers) {
    var sel_x = $('#sel-x');
    var sel_y = $('#sel-y');

    for(var i = 0; i < headers.length; i++) {
      if(headers[i] !== 'name' && headers[i] !== 'origin') {
        $('<option></option>')
          .val(headers[i])
          .text(headers[i])
          .appendTo(sel_x);

        $('<option></option>')
          .val(headers[i])
          .text(headers[i])
          .appendTo(sel_y);
      }
    }

    var x_axis = $('#sel-x option[value="mpg"]').attr("selected",true);
    var y_axis = $('#sel-y option[value="displacement"]').attr("selected",true);
    $('#update').html('Query ' + x_axis.val() );

  }

  function updatePlot(values) {

    var s = d3.selectAll('svg');
    s = s.remove();


  svg = d3.select('.content')
              .append('svg')
              .attr('width', w)
              .attr('height', h);

    var x = d3.scale.linear()
              .domain((d3.extent(values, function (d) {
                  return +d.x;
              })))
              .range([left_pad, w-pad]);

    var y = d3.scale.linear()
              .domain((d3.extent(values, function (d) {
                  return +d.y;
              })))
              .range([pad, h-pad*2]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickPadding(2);
    var yAxis = d3.svg.axis().scale(y).orient("left").tickPadding(2);

    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0, "+(h-pad)+")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate("+(left_pad-pad)+", 0)")
      .call(yAxis);

    svg.selectAll('circle')
      .data(values)
      .enter()
      .append('circle')
      .attr('r', 2.5)
      .attr('transform', function (d) {
        return "translate(" + x(+d.x) + "," + y(+d.y) + ")";
      });

  };

});

