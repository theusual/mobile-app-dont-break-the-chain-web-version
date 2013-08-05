//Global variables and global functions stored here
 $(document).bind("mobileinit", function()  //bind mobileinit event handler to the document, executes as soon as jquerymobile starts
	{			

			//Set global DB settings namespace
			$.localStorage = window.localStorage;
					
			//Set current App settings
			$.AppSettings = 
				{
					dbVersion: '.698',
					testing: 'true'
				};	
			//Run tests			
			if($.AppSettings.testing === 'true')
				console.log('Starting app...');
				
			if($.AppSettings.testing === 'true')
				{
					if(Modernizr.svg)
						{
							console.log("working on SVG capable browser");
						}else {
							console.log("working on browser not supporting SVG.  Converting all graphics to canvas.");
					   }	
				}
			//disable the JQM loading message that is stuck at bottom of page
			$.mobile.loadingMessage = false;
			//start the process of checking DB versions and creating the DB if necessary
			checkDBVersion();
		
});	

$(document).ready(function(){
		//Options for the Spectrum color picker:		
		$("#XColor").spectrum({
			showPalette: true,
			showSelectionPalette: false,
			clickoutFiresChange: true,
			preferredFormat: "hex",
			move: function (color) {
				document.forms["frmGoals"]["XColor"].value = color.toHexString();
			},
			change: function (color) {
				document.forms["frmGoals"]["XColor"].value = color.toHexString();
			},
			palette: [
				['#06fdfd','#e50000'],
				['#f97306','#01ff07'],
				['#c9ae74','#ff028d'],
				['#F2DA00','#9a0eea'],
				['#00349B','#ffff96']
			]
		})
		
		//load login page on startup
		launchLoginPage();
		
		//Hide legend on startup
		$('#legendContainer').toggle();

		//update all date divs with current month dates
		buildMonth('current');	
			
		//build the legend with active goals from the database
		legendAddGoals_OnStartup() ;

		//update the HTML being displayed in the goal legend using goal info stored in DB and update the form values displaying in the update goals dialog form	
		updateLegendHTML();
		
		//initiate the legend to highlight the current selected goal
		setGoal($.UserSettings.SelectedGoal);
				

});	

//REMOVE THIS LATER IF NOT USED, THIS IS FOR PAGEINIT EVEN WHICH LOADS ON EVERY PAGE LOAD INSTEAD OF JUST ON APP LOAD LIKE DOCUMENT READY
$('#clouds').live( 'pageinit',function(event){

});
////////////////////


function buildMonth(nextPrev)
	{
	//update all div structures in the calcontainer to reflect the user's selected month
		//First, move the selected month forward (next) or backward (prev) depending on which button was clicked, if (current) do nothing
		if(nextPrev === 'next')
		{
			$.UserSettings.SelectedMonth++;
			
			if($.UserSettings.SelectedMonth === 13)
			{
				//reset selected month to 1(January)
				$.UserSettings.SelectedMonth=1;
				//change the selected year to next one in line
				$.UserSettings.SelectedYear++;
			}
		} 
		if(nextPrev === 'prev')
		{
			$.UserSettings.SelectedMonth--;
			
			if($.UserSettings.SelectedMonth === 0)
			{
				//reset selected month to 12 (December)
				$.UserSettings.SelectedMonth=12;
				//change the selected year to one previous
				$.UserSettings.SelectedYear--;
			}
		} 	
		//build calendar by updating calendar header, day headers, and the data-date contained in each day div
		buildMonthDates();
					
		//call function to prepopulate the calendar with previously stored X dates  <--make this a callback for checkDBversion?
		loadXs('all');
	}
	
function buildMonthDates()
	{
		//Build the calendar dates.  If the function is sent 'next' then it changes dates to next month in line, if it's sent 'prev' then it changes the dates to the
		// previous month in line, if it's sent 'current' then it just populates the current month (used on program start)
		
		//Calendar variables
		var today = new Date(),
			firstDay,
			startingDay,
			formattedDate,
			monthLength,
			prevMonthLength,
			dataDate,
			counter,
			currentMonthCounter = 1,
			nextMonthCounter = 1,
			prevMonthCounter,
			calDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
			cal_months_labels = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL','MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER','OCTOBER', 'NOVEMBER', 'DECEMBER'],
			NewMonth;
			
		//update calendar header
		$('#calTitle').html('<h2>' + cal_months_labels[($.UserSettings.SelectedMonth-1)] + ' ' + $.UserSettings.SelectedYear + '</h2>');
		//line below is deprecated -- use if wanting to load static month images instead of dynamic text
		//$('#calTitleImage').html('<img src="img/' + cal_months_labels[($.UserSettings.SelectedMonth-1)] + '.gif" class="headerImg">');
		//get month lengths	
		monthLength = getMonthLength($.UserSettings.SelectedMonth);
		prevMonthLength = getMonthLength(($.UserSettings.SelectedMonth-1));				
		// get starting day of the month for use int the first row calculations
		if($.UserSettings.SelectedMonth === 1)
			firstDay = new Date(($.UserSettings.SelectedYear-1), '12', 1);
		else
			firstDay = new Date($.UserSettings.SelectedYear, $.UserSettings.SelectedMonth-1, 1);
		startingDay = firstDay.getDay();
		prevMonthCounter = startingDay;
		
		//iterate through the first row of days
		for (var j = 1; j <8 ; j++) 
		{
			//if day of week is less than the first day of the month, then change its class and data-date
			if(j-1<startingDay)
			{
				//change the day class to dayOtherMonth, which will lightly shade the days that are in other months
				$('#calRow1Col'+j).attr('class','dayOtherMonth');
				//change the daybar class which will un-bold the date text
				$('#calRow1Col'+j).find('#daybar').attr('class','daybarOtherMonth');
				//update the data-date 
				if($.UserSettings.SelectedMonth === 1)
					$('#calRow1Col'+j).find('#dotContainer').attr('data-date', '12' + '/' + (32-prevMonthCounter) + '/' + $.UserSettings.SelectedYear-1);
				else
					$('#calRow1Col'+j).find('#dotContainer').attr('data-date',($.UserSettings.SelectedMonth - 1) + '/' + ((prevMonthLength+1)-prevMonthCounter) + '/' + $.UserSettings.SelectedYear);
				//update day header 
				$('#calRow1Col'+j).find('#daybar').html('<p>' + (32-prevMonthCounter) + '</p>');
				//add right side border to last day of previous month
				if(j === startingDay)
				{
					$('#calRow1Col'+j).find('#dotContainer').css("border-right","3px solid #e5e5e5");	
				} else
				{  //clear the right border
					$('#calRow1Col'+j).find('#dotContainer').css("border-right","0px solid #e5e5e5");
				}
				prevMonthCounter--;
			} else 
			{
				//reset the days to the normal day class
				//if last day in week change to daybrn class
				if(j===7)
				{
					$('#calRow1Col'+j).attr('class','daybrn');
				} else
				{
				$('#calRow1Col'+j).attr('class','day');
				}	
				//unbold the date header
				$('#calRow1Col'+j).find('#daybar').attr('class','daybar');
				//clear the right border
				$('#calRow1Col'+j).find('#dotContainer').css("border-right","0px solid #e5e5e5");
				//update the data-date 
				$('#calRow1Col'+j).find('#dotContainer').attr('data-date',($.UserSettings.SelectedMonth) + '/' + (j - startingDay) + '/' + $.UserSettings.SelectedYear);
				//update day header
				$('#calRow1Col'+j).find('#daybar').html('<p>' + (j-startingDay) + '</p>');
				currentMonthCounter++;
			}
		}
		
		//iterate through the middle 4 rows of days
		for(var i = 2; i < 5; i++)
		{
		
			for(j = 1; j < 8; j++)
			{					
				//update the data-date 
				$('#calRow'+i+'Col'+j).find('#dotContainer').attr('data-date',($.UserSettings.SelectedMonth) + '/' + (currentMonthCounter) + '/' + $.UserSettings.SelectedYear);
				//update day header
				$('#calRow'+i+'Col'+j).find('#daybar').html('<p>' + (currentMonthCounter) + '</p>');
				currentMonthCounter++;
				//reset the class to day to undo the current day highlighting -- This isn't necessary for the first and last 			
				//2 weeks sections because they already reset the day class as part of their function
				$('#calRow'+i+'Col'+j).attr('class','day');
			}
		}
		
		//iterate through the 2 final rows of days	
		for(var i = 5; i < 7; i++)
		{		
			for(j = 1; j < 8; j++)
			{		
				if(currentMonthCounter <= monthLength)			
				{
					//reset the days to the normal day class and daybar class
					//if last day in week change to daybrn class
					if(j===7)
					{
						$('#calRow'+i+'Col'+j).attr('class','daybrn');
					} else
					{
					$('#calRow'+i+'Col'+j).attr('class','day');
					}	
					//unbold the date header
					$('#calRow'+i+'Col'+j).find('#daybar').attr('class','daybar');
					//update the data-date 
					$('#calRow'+i+'Col'+j).find('#dotContainer').attr('data-date',($.UserSettings.SelectedMonth) + '/' + (currentMonthCounter) + '/' + $.UserSettings.SelectedYear);
					//update day header
					$('#calRow'+i+'Col'+j).find('#daybar').html('<p>' + (currentMonthCounter) + '</p>');
					//add right side border to last day of month
					if((currentMonthCounter === monthLength) && (j!==7))
					{					
						$('#calRow'+i+'Col'+j).find('#dotContainer').css("border-right","3px solid #e5e5e5");	
					} else
					{  //clear the right border
						$('#calRow'+i+'Col'+j).find('#dotContainer').css("border-right","0px solid #e5e5e5");
					}
					currentMonthCounter++;
				} else
				{
					//change the day class to dayOtherMonth, which will lightly shade the days that are in other months
					$('#calRow'+i+'Col'+j).attr('class','dayOtherMonth');
					//change the daybar class which will un-bold the date text
					$('#calRow'+i+'Col'+j).find('#daybar').attr('class','daybarOtherMonth');
					//clear the right border
					$('#calRow'+i+'Col'+j).find('#dotContainer').css("border-right","0px solid #e5e5e5");
					//update the data-date 
					if($.UserSettings.SelectedMonth === 12)
						$('#calRow'+i+'Col'+j).find('#dotContainer').attr('data-date', '1' + '/' + (nextMonthCounter) + '/' + ($.UserSettings.SelectedYear+1));
					else
						$('#calRow'+i+'Col'+j).find('#dotContainer').attr('data-date',($.UserSettings.SelectedMonth+1) + '/' + (nextMonthCounter) + '/' + $.UserSettings.SelectedYear);
					//update day header
					$('#calRow'+i+'Col'+j).find('#daybar').html('<p>' + (nextMonthCounter) + '</p>');
					nextMonthCounter++;
				}	
			}
		}
		//highlight background of day that contains today's date
		$('div[data-date="' + $.UserSettings.CurrentDate + '"]').parent().attr('class','dayToday');
	}
	
function loadXs(goalNum)
	{
		if (goalNum === 'all')
		{	
			//empty all divs prior to redrawing all Xs
			$(".goaldot").empty();
			//iterate through each goal table if it contains data. draw an X for each date found in the table.  Note: Using iterator variable j instead of goalnum
			for(var j = 1; j<9; j++)
			{
				if ($.UserGoals["Goal"+j].DayDate.length > 0)
				{
					for (var i = 0; i < $.UserGoals["Goal"+j].DayDate.length; i++)
					 {
					  if($.UserGoals["Goal"+j].DayDate[i] !== null)
						{	  
						  var DayObj = $(document).find("[data-date='" + $.UserGoals["Goal"+j].DayDate[i] + "']");
						  if(DayObj.attr('data-date') !== undefined)
						  {
							  var DayDOM = DayObj.find("#goal"+j+"dot")[0];
					          drawXsvg(DayDOM,$.UserGoals["Goal"+j].XColor);
						  }
						}		  
					 }
				}
			}
		}		
		else if ($.UserGoals["Goal"+goalNum].DayDate.length > 0)
			{
				for (var i = 0; i < $.UserGoals["Goal"+goalNum].DayDate.length; i++)
				 {
				  if($.UserGoals["Goal"+goalNum].DayDate[i] !== null)
					{	  
					  var DayObj = $(document).find("[data-date='" + $.UserGoals["Goal"+goalNum].DayDate[i] + "']");
					  if(DayObj.attr('data-date') !== undefined)
					  {
					  	  $(DayObj).find("#goal"+goalNum+"dot").empty();
						  var DayDOM = DayObj.find("#goal"+goalNum+"dot")[0];
				          drawXsvg(DayDOM,$.UserGoals["Goal"+goalNum].XColor);
					  }
					}		  
				 }
			}	
	}
	
function unloadXs(goalNum)
	{		
		if ($.UserGoals["Goal"+goalNum].DayDate.length > 0)
			{
				for (var i = 0; i < $.UserGoals["Goal"+goalNum].DayDate.length; i++)
				 {
				  if($.UserGoals["Goal"+goalNum].DayDate[i] !== null)
					{	  
					  var DayObj = $(document).find("[data-date='" + $.UserGoals["Goal"+goalNum].DayDate[i] + "']");
					  if(DayObj.attr('data-date') !== undefined)
					  {
						  var DayDOM = DayObj.find("#goal"+goalNum+"dot")[0];
				          $(DayObj).find("#goal"+goalNum+"dot").empty();
						  unDrawXsvg(DayDOM, $.UserGoals["Goal"+goalNum].XColor);
					  }
					}		  
				 }
			}	
	}

//-------------------------------------------------------------------------------------------
//Legend related functions
//-------------------------------------------------------------------------------------------

//toggle showing the legend
function toggleLegend()
{
    $('#legendContainer').toggle();
}

//Handle the "Add Goal" button on Legend
function legendAddGoal_btnHandler() 
	{
			//find next goal
		    var nextGoal = legendFindNextGoal();
		    if(nextGoal == 9)
			{
				alert("Sorry, you may only have 8 active goals at one time.");
				return;
			}
			
			//Activate the next goal
			$.UserGoals["Goal"+nextGoal].Active = 1
			
			//add the new goal to the array used to persist the goal ordering across logins, then update the DB with new settings
			$.UserSettings.goalsSortOrder.push(nextGoal);
			updateDB_CurrentSettings();
				
			//call function to add next goal html to the legend
			legendAddGoal(nextGoal);
						
			//dynamically update the HTML just added with goal info stored in DB
			updateLegendHTML();
			
			//update the databases
			updateDB_Goal(nextGoal);
			
		    //Apply markup to the dynamically added button
			$('#btnDropGoal' + nextGoal).buttonMarkup();
			$('#btnClearGoal' + nextGoal).buttonMarkup();
			$('#btnEditGoal' + nextGoal).buttonMarkup();
			
			//hide then show the legend to fix the bug of the newly added goal divs not showing
			$('#legend').toggle();
			$('#legend').toggle();
			
			//set the just added goal as the current goal
			setGoal(nextGoal);
			
	}
function legendAddGoal(goalNum)
	{
		$("#legend").append('<div class="legendLine" id="legendLine' + goalNum + '"><div class="goalDesc" onClick="setGoal('+ goalNum +');" id="goal'+ goalNum +'"><div class="goalDot blue" id="legendDotGoal'+ goalNum + '"></div><div class="goalText" id="goal' + goalNum + 't">Goal</div></div><a href="#popupClearGoal" id="btnClearGoal'+ goalNum + '" data-position-to="window" data-rel="popup" data-role="button" data-transition="pop" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-theme="b" aria-haspopup="true" aria-owns="#popupClearGoal" onClick="setGoal(' + goalNum + ')" style="margin-top:6px; margin-bottom:6px">Clear</a>&nbsp&nbsp<a href="#popupUpdateGoals" id="btnEditGoal'+goalNum+'" data-position-to="window" data-rel="popup" data-role="button" data-transition="pop" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-theme="b" onClick="setSelectedGoal('+ goalNum +')"> &nbspEdit&nbsp </a>&nbsp&nbsp<a href="#popupDropGoal" id="btnDropGoal'+ goalNum + '" data-rel="popup" data-position-to="window" data-overlay-theme="a" data-role="button" data-transition="pop" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-theme="b" aria-haspopup="true" aria-owns="#popupDropGoal" onClick="setSelectedGoal('+goalNum+')" style="margin-top:6px; margin-bottom:6px">&nbspDrop&nbsp</a></div>');
	}
	
function legendAddGoals_OnStartup() 
	{
		//iterate over the goalsSortOrder array and for each goal found, add it to the legend in sequential order
		for(var i=0;i<$.UserSettings.goalsSortOrder.length;i++)
			legendAddGoal($.UserSettings.goalsSortOrder[i]);
		
		//set current goal to the first active goal found
		setGoal(legendFindActiveGoal());
	}

//function to update goal information entered into the update goals dialog		
function updateGoalInfo(goalNum)
	{				
		//reload Xs for selected goal if color changed
	 	if($.UserGoals["Goal"+goalNum].XColor !== document.forms["frmGoals"]["XColor"].value)
 			{
 				$.UserGoals["Goal"+goalNum].XColor = document.forms["frmGoals"]["XColor"].value;
 				loadXs(goalNum);					 				
 			}
 			
 		//update the goal object in memory	
 		$.UserGoals["Goal"+goalNum].Description = document.forms["frmGoals"]["goalName"].value;
 		$.UserGoals["Goal"+goalNum].Notes = document.forms["frmGoals"]["goalNote"].value;
 		$.UserGoals["Goal"+goalNum].XGoal = document.forms["frmGoals"]["goalX"].value;
		
		//update the databases
		updateDB_Goal(goalNum);
		
		//update the HTML currently being displayed in the goal legend
		updateLegendHTML();		
		
		//set the goal to the currently updated goal
		setGoal(goalNum);				
	}
	

function updateLegendHTML()
	{
			//update the HTML being displayed in the goal legend using goal info stored in DB
			for(var i=1;i<11;i++)	
				$('#goal'+i+'t').html($.UserGoals["Goal"+i].Description);
			//update the colors displayed in the legend
			for(var i=1;i<11;i++)
				$('#legendDotGoal'+i).css("background",$.UserGoals["Goal"+i].XColor);
			//update the colors displayed in the small legend
			for(var i=1;i<11;i++)
				$('#smallLegendDotGoal'+i).css("background",$.UserGoals["Goal"+i].XColor);
	}	
	
function legendFindNextGoal() 
	{
		for(var i=1;i<11;i++)
		{
			if($.UserGoals["Goal"+i].Active === 0)
			{
				return i;
			}
		} 
	}
	
function legendFindActiveGoal() 
	{
		for(var i=1;i<11;i++)
		{
			if($.UserGoals["Goal"+i].Active === 1)
			{
				return i;
			}
		} 
	}
	
function legendRemoveGoal() 
	{		
			//remove drawn calendar Xs
			unloadXs($.UserSettings.SelectedGoal);
			
			//reset goal object to default settings
			$("#legendLine"+$.UserSettings.SelectedGoal).empty().remove();
			$.UserGoals["Goal"+$.UserSettings.SelectedGoal].Active = 0;
			//$.UserGoals["Goal"+$.UserSettings.SelectedGoal].SortOrder = $.UserGoals["Goal"+$.UserSettings.SelectedGoal].SortOrder + 10;
			$.UserGoals["Goal"+$.UserSettings.SelectedGoal].Description = 'Goal';
			$.UserGoals["Goal"+$.UserSettings.SelectedGoal].Notes = '';
			$.UserGoals["Goal"+$.UserSettings.SelectedGoal].XGoal = '30';
			$.UserGoals["Goal"+$.UserSettings.SelectedGoal].DayDate = [];
			$.UserGoals["Goal"+$.UserSettings.SelectedGoal].XColor = $.UserSettings.defaultGoalColor[$.UserSettings.SelectedGoal];

			//update goal object in DB
			updateDB_Goal($.UserSettings.SelectedGoal);	
			
			//remove the goal from the goalsSortOrder array used to persist ordering across logins, then update DB with new settings
			$.UserSettings.goalsSortOrder.splice($.UserSettings.goalsSortOrder.indexOf($.UserSettings.SelectedGoal),1);
			updateDB_CurrentSettings();
			
			//reset current goal to first active goal found)
			setGoal(legendFindActiveGoal());
	}

function setGoal(goalNum)
{
		//revert all classes to normal:  'goalDesc'
		for(var i=1;i<11;i++)
			$(document).find('#goal'+i).attr('class', 'goalDesc');
		
		//change the class of the selected Goal Div to selected: 'goalDescSelected'
		$('#goal'+ goalNum).attr('class', 'goalDescSelected');
		
		//store the new selected goal in the global user settings variable
		$.UserSettings.SelectedGoal = goalNum;
		
		//update the edit goal form
		document.forms["frmGoals"]["goalName"].value = $.UserGoals["Goal"+goalNum].Description;
		document.forms["frmGoals"]["goalNote"].value = $.UserGoals["Goal"+goalNum].Notes;
		document.forms["frmGoals"]["goalX"].value = $.UserGoals["Goal"+goalNum].XGoal;
		$("#XColor").spectrum("set", $.UserGoals["Goal"+goalNum].XColor);
		
		//Set the X drawing location
		$.UserSettings.DrawDotDiv = ('#goal' + goalNum + 'dot');
		
		//Set the current color for drawing Xs to the current Xcolor of the selected goal
		$.UserSettings.DrawColor = $.UserGoals["Goal" + goalNum].XColor;
}

function drawX(clickedDayDiv) 
{
	var ClickedDate = $(clickedDayDiv).attr('data-date');
	//find the correct DOM ojbect (NOT a jQuery object!) to feed to the drawing functions
	var DrawDotDivDOM =  $(clickedDayDiv).find($.UserSettings.DrawDotDiv)[0];
	var DayDBLocation = checkDay(ClickedDate);
	//console.log("Drawing Date:" + ClickedDate);
	if (DayDBLocation < 0)
		{
			//insert day into DB
			//alert('Calling insertDay() with currentl selected goal:' + $.UserSettings.SelectedGoal);
			insertDay(ClickedDate);
			
			//draw the X
			if(Modernizr.svg) 
			{
				//empty any leftover SVG segments from the DIV so that it does not affect the new X
				$(clickedDayDiv).find($.UserSettings.DrawDotDiv).empty();
			    drawXsvg(DrawDotDivDOM, $.UserSettings.DrawColor);
			} else{
				  drawXcanvas(DrawDotDivDOM,$.UserSettings.DrawColor);
			  	  }
			   
		} else 
			{
				//remove day from DB
				removeDay(ClickedDate, DayDBLocation);
				
				//undraw the X
				$(clickedDayDiv).find($.UserSettings.DrawDotDiv).empty();
				unDrawXsvg(DrawDotDivDOM, $.UserSettings.DrawColor);
			}
		switch (true) {
			case ($.UserSettings.Count === 30):  window.alert("Over a month?! You fucking rock!");
				break;
			case $.UserSettings.Count === 20:  window.alert("20 days? That's actually impressive.  No, really!");
				break;
			case $.UserSettings.Count === 10:  window.alert("10 days? Well, I've seen worse...");
				break;
			case $.UserSettings.Count === 5:  window.alert("5 down! It's a start...!");
				break;		
		}
		$.UserSettings.Count++;
}

/////////////////////////////
//Form functions
/////////////////////////////
function validateGoalsForm(){
	var x=document.forms["frmGoals"]["goalName"].value;
	if (x.length === 20) {
	  alert("Sorry! Goal name must be 20 chars. or less");
	  return false;
	}
    else {
		  	//if everything validates then update goal info
		  	updateGoalInfo();
	}
}

function validateRegistrationForm(){
    var userName=document.forms["frmRegistration"]["regUserName"].value;
    var userPassword1=document.forms["frmRegistration"]["regUserPassword1"].value;
    var userPassword2=document.forms["frmRegistration"]["regUserPassword2"].value;

    var emailRegExp = /[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[a-z0-9-]*[A-Za-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/;
    var passwordRegExp = /^[A-Za-z0-9!@#$%.&*+=?^_~-]+$/;

    if (!(emailRegExp.test(userName.toLowerCase()))){
        $("#registration-info").text("User name must be a valid email address.");
        $("#regUserName").focus();
        return;
    }
    if (userPassword1 !== userPassword2){
        $("#registration-info").text("Passwords entered do not match.");
        $("#regUserPassword2").focus();
        return;
    }
    if (!((passwordRegExp.test((userPassword1))))){
        $("#registration-info").text("Sorry, passwords can only consist of numbers, letters, or !@#$%^&*_~-+.");
        $("#regUserPassword1").focus();
        return;
    }
    if (userPassword1.length < 5){
        $("#registration-info").text("Sorry, password must be between 5 and 50 characters.");
        $("#regUserPassword1").focus();
        return;
    }
    if (userPassword1.length > 100){
        $("#registration-info").text("Sorry, password must be between 5 and 50 characters.");
        $("#regUserPassword1").focus();
        return;
    }
    //if everything validates then update goal info
    registration_to_server();
}
	
///////////////////
//misc functions
///////////////////	


	
	//extend localStorage to allow for objects using JSON
	
	window.Storage.prototype.setObject = function(key, value) 
		{
			this.setItem(key, JSON.stringify(value));
		}
						 
	window.Storage.prototype.getObject = function(key) 
		{
			return JSON.parse(this.getItem(key));
		}	
						
	//get date in nice format
	
	$.getFormattedDate = function (date)
		{
			var Today = date;
			
			if(Today === 'today')
				Today = new Date();
	
			return ((Today.getMonth() + 1) + '/' + Today.getDate() + '/' + Today.getFullYear());
		}
		
	//get current month
	
	$.getCurrentMonth = function ()
		{
			var Today = new Date();
	
			return (Today.getMonth() + 1);
		}
		
	//get current year
	
	$.getCurrentYear = function ()
		{
			var Today = new Date();
	
			return Today.getFullYear();
		}
	
	//get month length
	
	function getMonthLength(month){
			// these are the days of the week for each month, in order
			var calDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];	
			var monthLength;
			
			if (month === 2) // February only!
			{ 
				if (($.UserSettings.SelectedYear % 4 === 0 && $.UserSettings.SelectedYear % 100 !== 0) || $.UserSettings.SelectedYear % 400 === 0){
					monthLength = 29;
				} else {
					monthLength = 28;
				}
			} else {
						monthLength = calDaysInMonth[(month - 1)];
			}
			return monthLength;
		}
		
	//useful function for finding presence of value in an array, returns true if present, false if not
	$.findInArray = function(arr,obj){
			return (arr.indexOf(obj) !== -1);
	}
						
	//set currently selected goal
	function setSelectedGoal(goalNum){
		$.UserSettings.SelectedGoal = goalNum;
		document.forms["frmGoals"]["goalName"].value = $.UserGoals["Goal"+goalNum].Description;
		document.forms["frmGoals"]["goalNote"].value = $.UserGoals["Goal"+goalNum].Notes;
		document.forms["frmGoals"]["goalX"].value = $.UserGoals["Goal"+goalNum].XGoal;
		$("#XColor").spectrum("set", $.UserGoals["Goal"+goalNum].XColor);
	}

	function launchLoginPage(){
		//handle "Remember Me"
		if ($.CurrentUser.RememberMe == true) {
			document.forms["frmLogin"]["userName"].value = $.CurrentUser.UserName;
			document.forms["frmLogin"]["userPassword"].value = $.CurrentUser.UserPassword;
			$('#rememberMe').prop("checked", true);
		}
		
		$("#lnkLoginPage").click();
		//$('#popupLogin').popup();
		//$('#popupLogin').popup("open");
	}

//-------------------------------------------------------------------------------------------
//Calendar loading functions -- Called when login or new account creation is successful
//-------------------------------------------------------------------------------------------

//Launch Calendar
function launchCalendar(){
    greetUser();
    rememberMe();
    transitionToCalendar();
}

//Greet user if not in test mode
function greetUser(){
    if ($.AppSettings.testing == false){
        if ($.CurrentUser.UserRealName.length < 1 || $.CurrentUser.UserRealName == null) {
            alert("Welcome " + $.CurrentUser.UserName.toUpperCase());
        } else {
            alert("Welcome " + $.CurrentUser.UserRealName);
        }
    }
}

//Handle "Remember Me" checkbox -- If checked set RememberMe to true and write to local storage for retrieval on next login.
// If unchecked, clear the frmLogin fields and set RememberMe to false and update DBs
function rememberMe(){
    if ($('#rememberMe').is(':checked') === true){
        $.CurrentUser.RememberMe=true;
        updateDB_UserSettings();
    }
    else {
        document.forms["frmLogin"]["userName"].value = "";
        document.forms["frmLogin"]["userPassword"].value = "";
        $.CurrentUser.RememberMe=false;
        updateDB_UserSettings();
    }
}

//-------------------------------------------------------------------------------------------
//Animated transitions between pages
//-------------------------------------------------------------------------------------------
function transitionToCalendar(){
    document.getElementById('calendarContainer').className = 'transitionIn';
    document.getElementById('registrationPage').className = 'transitionOut';
    document.getElementById('loginPage').className = 'transitionOut'
}
function transitionToLogin(){
    document.getElementById('calendarContainer').className = 'transitionOut';
    document.getElementById('registrationPage').className = 'transitionOut';
    document.getElementById('loginPage').className = 'transitionIn';
    //$("#UserName").focus();
}
function transitionToRegistration(){
    document.getElementById('calendarContainer').className = 'transitionOut';
    document.getElementById('registrationPage').className = 'transitionIn';
    document.getElementById('loginPage').className = 'transitionOut';
    //$("#regUserName").focus();
}