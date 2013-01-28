// SVG Graphics for Calendar App

//Initiate the paper (canvas) on window load
window.onload = function() {  
	var paper = new Raphael(document.getElementById('mark_container1'), 50, 30);
	//var circle = paper.circle(12,17,6);
	//circle.attr({'stroke-width':1, stroke:'#000000', fill:'#ff0000'});
	var line = paper.path("M2 2z").attr({stroke: '#ff0000', 'stroke-width': 3});
	var line2 = paper.path("M17 2z").attr({stroke: '#ff0000', 'stroke-width': 3});
		 
	 line.animate({path: "M2 2 17 17 z"}, 800, function() {
		    line2.animate({path: "M17 2 2 17 z"}, 800);
	 });
	}


	