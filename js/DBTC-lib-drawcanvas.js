// JavaScript Document
function  drawXcanvas(clickedDayDiv,DrawColor)
{
   // var containerID = $("#day");
	//Create a canvas
    var canvas = document.createElement("canvas");
	canvas.setAttribute("style", "height:" + 17 + ";width:" + 17 + ";");
	
	//load '../path/to/your.svg' in the canvas with id = 'canvas'
	canvg(canvas, 'drawx.svg')
 
    //Remove the SVG/VML and show the canvas rendering
    //$(dayDivID).empty();
    $(clickedDayDiv).append(canvas);
}