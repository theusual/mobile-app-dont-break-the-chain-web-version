//Draw X in SVG
function drawXsvg(clickedDayDiv, DrawColor)
	{
		
		var paper = new Raphael(clickedDayDiv, 22,  22);
		var line = paper.path("M2 2z").attr({stroke: DrawColor, 'stroke-width': 6});
		var line2 = paper.path("M22 2z").attr({stroke: DrawColor, 'stroke-width': 6});
		line.animate({path: "M2 2 22 22 z"}, 670, function() {
			line2.animate({path: "M22 2 2 22 z"}, 670);
		});
		return;
	}
		
function unDrawXsvg(clickedDayDiv, DrawColor)
	{
		//alert('UNdrawing X'+ clickedDayDiv);
		var paper = new Raphael(clickedDayDiv, 22,  22);
		var line = paper.path("M2 2 22 22 z").attr({stroke: DrawColor, 'stroke-width': 6});
		var line2 = paper.path("M22 2 2 22 z").attr({stroke: DrawColor, 'stroke-width': 6});
	
		line.animate({path: "22 22 M2 2 z"}, 500, function() {
			line2.animate({path: "2 22 M22 2 z"}, 500);
		});
		return;
	}

function drawStaticXsvg(clickedDayDiv, DrawColor)
	{
		//alert('Drawing static X on:' + clickedDayDiv.id);
		var paper = new Raphael(clickedDayDiv, 22,  22);
		var line = paper.path("M2 2 22 22 z").attr({stroke: DrawColor, 'stroke-width': 6});
		var line2 = paper.path("M22 2 2 22 z").attr({stroke: DrawColor, 'stroke-width': 6});
		return;
	}