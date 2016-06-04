// oscilliscope.js
//
// A type of object for modeling an oscilliscope.  Used for displaying 
// fourier polynomials.

// Requiers d3.js

var Oscilloscope = function(fourierp, xs) {

  // Private variables to be initialized at setup time
  var _elem, _width, _height, _svg

  // The fourier polynomial being displayed on the oscilliscope
  var _fourierp = fourierp

  // (xs, ys) is the curve currently displayed on the osciliscope, 
  // it is always some cycling of _fourierp.
  var _xs = (function() {
    if(xs === undefined) {
      return d3.range(0, 1, .0025)
    } else {
      return xs
    }
  })()

  var _ys = _fourierp.eval(_xs)

  // The phase is used to keep track of how much _fourierp has been horisontally
  // offset in the animation of the osciliscope.
  var _phase = 0

  return {
  
    // Number of frames in a full cycle of the osciliscope.
    get _nframes() {
      return _xs.length
    },

    // Cycle the state of the osciliscope by one frame of animation
    cycle: function() {
      var y0 = _ys[0]
      _ys = _ys.slice(1, _ys.length)
      _ys.push(y0)
      // TODO: Modulo by one to prevent overflow
      _phase += 1 / this._nframes
    },

    // Update the internals of the osciliscope to display a new fourier 
    // polynomial.
    update: function(fp) {
      _fourierp = fp
      _ys = fp.eval(_xs, _phase)
    },

    // Render the curve on the osciliscope
    render: function(e) {
      var xscale, yscale, data, line
      // Bind a the oscilliscope to a dom element
      if(typeof e !== "undefined") {
        _elem = e
        _width = parseInt(d3.select(_elem).style("width"))
        //_height = parseInt(d3.select(_elem).style("height"))
        _height = parseInt(50)
        _svg = d3.select(_elem).append("svg")
                              .attr("width", _width)
			       .attr("height", _height)
      }
      // Render a curve on the osciliscope.  If no path has yet been
      // rendered, construct and render from scratch, otherwise, animate
      // transition to new path, creating the effect that the curve is 
      // translating cyclically.
      xscale = d3.scale.linear()
                 .domain([0, 1])
		 .range([0, _width])
      yscale = d3.scale.linear()
                 .domain([-_fourierp.pmax, _fourierp.pmax])
		 .range([0, _height])
      data = d3.zip(_xs, _ys)
      line = d3.svg.line()
                   .x(function(d) {return xscale(d[0])})
                   .y(function(d) {return yscale(d[1])})
		   .interpolate("linear")
      // path element exists??
      if(_svg.select("path")[0][0] !== null) {
        _svg.selectAll("path")
	    .transition()
	    .duration(100)
	    .ease("linear")
	    .attr("d", line(data))
      } else {
        _svg.append("path")
            .attr("d", line(data))
	    .attr("stroke", "black")
	    .attr("stroke-width", 2)
	    .attr("fill", "none")
      }
    },

  }
}
