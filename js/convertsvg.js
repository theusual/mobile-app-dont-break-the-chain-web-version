// JavaScript Document

    var containerID = $("#mark_container");
	//Create a canvas
    var canvas = document.createElement("canvas");
	canvas.setAttribute("style", "height:" + 500 + ";width:" + 500 + ";");
	
	//load '../path/to/your.svg' in the canvas with id = 'canvas'
	canvg(canvas, 'testdwg2-plain.svg')
 
    //Remove the SVG/VML and show the canvas rendering
    containerID.empty();
    containerID.append(canvas);