// SVG Graphic Testing

//Initiate the paper (canvas) on window load
window.onload = function() {  
    var paper = new Raphael(document.getElementById('mark_container'), 800, 800);

     var circ = paper.circle(250, 250, 20).attr({fill: '#000'});  
//    var mood_text = paper.text(250, 250, 'My\nMood').attr({fill: '#fff'});  
//	
//     var line = paper.path("M77 1z").attr({stroke: '#ff0000', 'stroke-width': 3});
//	 var line2 = paper.path("M92 0z").attr({stroke: '#ff0000', 'stroke-width': 3});
//		 
//	 line.animate({path: "M92 16 77 1 z"}, 800, function() {
//		    line2.animate({path: "M92 0 77 16 z"}, 800);

	var star1 = paper.path("M 24.166665,34.166667 17.773304,26.213938 7.5975414,26.972111 13.18538,18.434135 9.3198307,8.9906974 l 9.8468343,2.6759706 7.786723,-6.5945384 0.49784,10.1918164 8.678008,5.367789 -9.539153,3.622918 z").attr({
	   fill:'#ffff00',stroke:'#000000','stroke-width':1,'stroke-opacity':1});
  	var star2 = paper.path("m 424.16666,35 -8.87458,-6.728178 -10.57364,3.496357 3.65648,-10.519344 -6.59267,-8.9757 11.13441,0.226865 6.49915,-9.0436442 3.22496,10.6595542 10.60936,3.386421 -9.14127,6.361101 z").attr({
	   fill:'#ffff00',stroke:'#000000','stroke-width':1,'stroke-opacity':1});
    var txtAward = paper.text(210,24,"FANTASTIC!").attr({
       'font-size':35,'letter-spacing':0,'word-spacing':0,fill:'#ff0000','fill-opacity':1});
	 

//
//	 
//    var tetronimo = paper.path("M 250 250 l 0 -50 l -50 0 l 0 -50 l -50 0 l 0 50 l -50 0 l 0 50 z"),  
//    tetronimo.attr(  
//        {  
//            gradient: '90-#526c7a-#64a0c1',  
//            stroke: '#3b4449',  
//            'stroke-width': 10,  
//            'stroke-linejoin': 'round',  
//            rotation: -90  
//        }  
//    ),  
// 
//	
//	moods = ['Rubbish', 'Not Good', 'OK', 'Smily', 'Positively Manic'],  
//	colors = ['#cc0000', '#a97e22', '#9f9136', '#7c9a2d', '#3a9a2d'],  
//  
//	//pick a mood between 1 and 5, 1 being rubbish and 5 being positively manic  
//	var my_mood = 3,  
//		
//function show_mood() {  
//  
//    for(var i = 0, i < my_mood, i+=1) {  
//        (function(i) {  
//            setTimeout(function() {  
//                paper.circle(250, 250, 20).attr({  
//                    stroke: 'none',  
//                    fill: colors[my_mood - 1]  
//                }).animate({transform:"t0" + (-42 * (i+1))}, 2000, 'bounce').toBack(),  
//            }, 50*i),  
//        })(i),  
//    }  
//    paper.text(250, 300, moods[my_mood - 1]).attr({fill: colors[my_mood - 1]}),  
//  
//    mood_text.node.onclick = function() {  
//        return false,  
//    }  
//    circ.node.onclick = function() {  
//        return false,  
//    }  
//	}
//    'mark_container'.node.onclick = show_mood,
//	
//	tetronimo.animate({rotation: 360, 'stroke-width': 1}, 2000, 'bounce', function() {  
//    /* callback after original animation finishes */  
//    this.animate({  
//        rotation: -90,  
//        stroke: '#3b4449',  
//        'stroke-width': 10  
//    }, 1000),  
//}), 
// 
} 
        
 




	