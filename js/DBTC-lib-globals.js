//Global variables and global functions stored here
 $(document).bind("mobileinit", function()  //bind mobileinit event handler to the document, executes as soon as jquerymobile starts
	{			

			//Set global DB settings
				$.localStorage = window.localStorage;
					
			//Set current App settings
				$.AppSettings = 
					{
												dbVersion: '.59',
						testing: 'false'
					};	
			//Run tests			
				if($.AppSettings.testing === 'true')
					alert('Starting app...');
					
				if($.AppSettings.testing === 'true')
					{
						if(Modernizr.svg)
							{
								window.alert("working on SVG capable browser");
							}else {
								window.alert("working on browser not supporting SVG.  Converting all graphics to canvas.");
						   }	
					}
			//misc settings
				//disable the JQM loading message that is stuck at bottom of page
				$.mobile.loadingMessage = false;
			//start the process of checking DB versions and creating the DB if necessary
			    checkDBVersion();
				
			//update all date divs with current month dates
				buildMonth('current');	
				
			//build the legend with active goals from the database
				legendAddGoals_OnStartup() ;
				
			//recalc sort order 
				
			//update the HTML being displayed in the goal legend using goal info stored in DB and update the form values displaying in the update goals dialog form	
				updateLegendHTML();
			
			//initiate the legend to highlight the current selected goal
				setGoal($.CurrentUserSettings.SelectedGoal);
				
			

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
});	
function buildMonth(nextPrev)
	{
	//update all div structures in the calcontainer to reflect the user's selected month
		//First, move the selected month forward (next) or backward (prev) depending on which button was clicked, if (current) do nothing
		if(nextPrev === 'next')
		{
			$.CurrentUserSettings.SelectedMonth++;
			
			if($.CurrentUserSettings.SelectedMonth === 13)
			{
				//reset selected month to 1(January)
				$.CurrentUserSettings.SelectedMonth=1;
				//change the selected year to next one in line
				$.CurrentUserSettings.SelectedYear++;
			}
		} 
		if(nextPrev === 'prev')
		{
			$.CurrentUserSettings.SelectedMonth--;
			
			if($.CurrentUserSettings.SelectedMonth === 0)
			{
				//reset selected month to 12 (December)
				$.CurrentUserSettings.SelectedMonth=12;
				//change the selected year to one previous
				$.CurrentUserSettings.SelectedYear--;
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
		$('#calTitle').html('<h2>' + cal_months_labels[($.CurrentUserSettings.SelectedMonth-1)] + ' ' + $.CurrentUserSettings.SelectedYear + '</h2>');
		//line below is deprecated -- use if wanting to load static month images instead of dynamic text
		//$('#calTitleImage').html('<img src="img/' + cal_months_labels[($.CurrentUserSettings.SelectedMonth-1)] + '.gif" class="headerImg">');
		//get month lengths	
		monthLength = getMonthLength($.CurrentUserSettings.SelectedMonth);
		prevMonthLength = getMonthLength(($.CurrentUserSettings.SelectedMonth-1));				
		// get starting day of the month for use int the first row calculations
		if($.CurrentUserSettings.SelectedMonth === 1)
			firstDay = new Date(($.CurrentUserSettings.SelectedYear-1), '12', 1);
		else
			firstDay = new Date($.CurrentUserSettings.SelectedYear, $.CurrentUserSettings.SelectedMonth-1, 1);
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
				if($.CurrentUserSettings.SelectedMonth === 1)
					$('#calRow1Col'+j).find('#dotContainer').attr('data-date', '12' + '/' + (32-prevMonthCounter) + '/' + $.CurrentUserSettings.SelectedYear-1);
				else
					$('#calRow1Col'+j).find('#dotContainer').attr('data-date',($.CurrentUserSettings.SelectedMonth - 1) + '/' + ((prevMonthLength+1)-prevMonthCounter) + '/' + $.CurrentUserSettings.SelectedYear);
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
				$('#calRow1Col'+j).find('#dotContainer').attr('data-date',($.CurrentUserSettings.SelectedMonth) + '/' + (j - startingDay) + '/' + $.CurrentUserSettings.SelectedYear);
				//update day header
				$('#calRow1Col'+j).find('#daybar').html('<p>' + (j-startingDay) + '</p>');
				currentMonthCounter++;
			}
			//alert($('#calRow1Col'+j).find('#dotContainer').attr('data-date'));
		}
		
		//iterate through the middle 4 rows of days
		for(var i = 2; i < 5; i++)
		{
		
			for(j = 1; j < 8; j++)
			{					
				//update the data-date 
				$('#calRow'+i+'Col'+j).find('#dotContainer').attr('data-date',($.CurrentUserSettings.SelectedMonth) + '/' + (currentMonthCounter) + '/' + $.CurrentUserSettings.SelectedYear);
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
					$('#calRow'+i+'Col'+j).find('#dotContainer').attr('data-date',($.CurrentUserSettings.SelectedMonth) + '/' + (currentMonthCounter) + '/' + $.CurrentUserSettings.SelectedYear);
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
					if($.CurrentUserSettings.SelectedMonth === 12)
						$('#calRow'+i+'Col'+j).find('#dotContainer').attr('data-date', '1' + '/' + (nextMonthCounter) + '/' + ($.CurrentUserSettings.SelectedYear+1));
					else
						$('#calRow'+i+'Col'+j).find('#dotContainer').attr('data-date',($.CurrentUserSettings.SelectedMonth+1) + '/' + (nextMonthCounter) + '/' + $.CurrentUserSettings.SelectedYear);
					//update day header
					$('#calRow'+i+'Col'+j).find('#daybar').html('<p>' + (nextMonthCounter) + '</p>');
					nextMonthCounter++;
				}	
			}
		}
		//highlight background of day that contains today's date
		$('div[data-date="' + $.CurrentUserSettings.CurrentDate + '"]').parent().attr('class','dayToday');
	}
	
function loadXs(goalNum)
	{
		//clear each day div of any Xs drawn the previous month, by emptying all divs with a class of .goaldot
		if (goalNum === 'all')
			$(".goaldot").empty();
		
		if (goalNum === '1' || goalNum === 'all')
		{
			//iterate through each goal table if it contains data. drawing an X for each date found in the table
			if ($.Goal1.DayDate.length > 0)
			{
				for (var i = 0; i < $.Goal1.DayDate.length; i++)
					{
					 //account for null values in the table
					  if($.Goal1.DayDate[i] !== null)
						{	  
						  var DayObj = $(document).find("[data-date='" + $.Goal1.DayDate[i] + "']")
						  if(DayObj.attr('data-date') !== undefined)
						  {
							  var DayDOM = DayObj.find('#goal1dot')[0];	  
							  drawXsvg(DayDOM,$.Goal1.XColor);	
						  }
						}
					}
			}
		}	
		if (goalNum === '2' || goalNum === 'all')
		{
			if ($.Goal2.DayDate.length > 0)
			{
				//alert('Records found in Goal2:' + $.Goal2.DayDate.length);	
				for (var i = 0; i < $.Goal2.DayDate.length; i++)
					{
					  if($.Goal2.DayDate[i] !== null)
						{	  
						  var DayObj = $(document).find("[data-date='" + $.Goal2.DayDate[i] + "']")
						  if(DayObj.attr('data-date') !== undefined)
						  {
							  var DayDOM = DayObj.find('#goal2dot')[0];	
							  //alert($.Goal2.DayDate[i]);	  
							  drawXsvg(DayDOM,$.Goal2.XColor);	
						  }
						}		  
					}
			}
		}
		if (goalNum === '3' || goalNum === 'all')
		{
			if ($.Goal3.DayDate.length > 0)
			{
				for (var i = 0; i < $.Goal3.DayDate.length; i++)
					{
					  if($.Goal3.DayDate[i] !== null)
						{	  
						  var DayObj = $(document).find("[data-date='" + $.Goal3.DayDate[i] + "']")
						  if(DayObj.attr('data-date') !== undefined)
						  {
							  var DayDOM = DayObj.find('#goal3dot')[0];		  
							  drawXsvg(DayDOM,$.Goal3.XColor);	
						  }
						}		  
					}
			}
		}
		if (goalNum === '4' || goalNum === 'all')
		{
			if ($.Goal4.DayDate.length > 0)
			{
				for (var i = 0; i < $.Goal4.DayDate.length; i++)
					{
					  if($.Goal4.DayDate[i] !== null)
						{	  
						  var DayObj = $(document).find("[data-date='" + $.Goal4.DayDate[i] + "']")
						  if(DayObj.attr('data-date') !== undefined)
						  {
							  var DayDOM = DayObj.find('#goal4dot')[0];	
							  drawXsvg(DayDOM,$.Goal4.XColor);	
						  }
						}		  
					}
			}
		}
		if (goalNum === '5' || goalNum === 'all')
		{
			if ($.Goal5.DayDate.length > 0)
			{
				for (var i = 0; i < $.Goal5.DayDate.length; i++)
					{
					  if($.Goal5.DayDate[i] !== null)
						{	  
						  var DayObj = $(document).find("[data-date='" + $.Goal5.DayDate[i] + "']")
						  if(DayObj.attr('data-date') !== undefined)
						  {
							  var DayDOM = DayObj.find('#goal5dot')[0];	
							  drawXsvg(DayDOM,$.Goal5.XColor);	
						  }
						}		  
					}
			}
		}
		if (goalNum === '6' || goalNum === 'all')
		{
			if ($.Goal6.DayDate.length > 0)
			{
				for (var i = 0; i < $.Goal6.DayDate.length; i++)
					{
					  if($.Goal6.DayDate[i] !== null)
						{	  
						  var DayObj = $(document).find("[data-date='" + $.Goal6.DayDate[i] + "']")
						  if(DayObj.attr('data-date') !== undefined)
						  {
							  var DayDOM = DayObj.find('#goal6dot')[0];	
							  drawXsvg(DayDOM,$.Goal6.XColor);	
						  }
						}		  
					}
			}
		}
		if (goalNum === '7' || goalNum === 'all')
		{
			if ($.Goal7.DayDate.length > 0)
			{
				for (var i = 0; i < $.Goal7.DayDate.length; i++)
					{
					  if($.Goal7.DayDate[i] !== null)
						{	  
						  var DayObj = $(document).find("[data-date='" + $.Goal7.DayDate[i] + "']")
						  if(DayObj.attr('data-date') !== undefined)
						  {
							  var DayDOM = DayObj.find('#goal7dot')[0];	
							  drawXsvg(DayDOM,$.Goal7.XColor);	
						  }
						}		  
					}
			}
		}
		if (goalNum === '8' || goalNum === 'all')
		{
			if ($.Goal8.DayDate.length > 0)
			{
				for (var i = 0; i < $.Goal8.DayDate.length; i++)
				{
				  if($.Goal8.DayDate[i] !== null)
					{	  
					  var DayObj = $(document).find("[data-date='" + $.Goal8.DayDate[i] + "']")
					  if(DayObj.attr('data-date') !== undefined)
					  {
						  var DayDOM = DayObj.find('#goal8dot')[0];	
						  drawXsvg(DayDOM,$.Goal8.XColor);	
					  }
					}		  
				}
			}
		}
	}
	
function unloadXs(goalNum)
	{
		//clear each day div of any Xs drawn the previous month, by emptying all divs with a class of .goaldot
		/*
		 if (goalNum === 'all')
			$(".goaldot").empty();
		else
		{
			alert('Emptying: ' + $.CurrentUserSettings.DrawDotDiv);
			$($.CurrentUserSettings.DrawDotDiv).empty();
		}*/
		alert("Unloading Xs for goal:" + goalNum);
		
		if ($["Goal"+goalNum].DayDate.length > 0)
			{
				for (var i = 0; i < $["Goal"+goalNum].DayDate.length; i++)
				 {
				 alert("Goal1 length:" + $.Goal1.DayDate.length + " Date" + $.Goal1.DayDate[i]);
				  if($["Goal"+goalNum].DayDate[i] !== null)
					{	  
					  var DayObj = $(document).find("[data-date='" + $["Goal"+goalNum].DayDate[i] + "']");
					  if(DayObj.attr('data-date') !== undefined)
					  {
						  var DayDOM = DayObj.find("goal"+goalNum+"dot")[0];
						  alert('Emptying goal dot:'+goalNum+DayDOM);
				          $(DayObj).find("#goal"+goalNum+"dot").empty();
						  unDrawXsvg(DayDOM, $["Goal"+goalNum].XColor);
					  }
					}		  
				 }
			}	
		//if = all	
	}
	
function changeClassGoalDiv(clickedObj)
	{		

		//alert($(clickedObj).attr('id'));
		
		//var updatedDescription  = document.getElementById(divID).innerHTML;
		
		//alert(updatedDescription);
		
		//change the class of the selected Goal Div to 'goalDescSelected'
		$(this).attr('class', 'goalDescSelected');
		
		//revert other goalDesc divs to the normal 'goalDesc' class
		switch ($(clickedObj).attr('id')) {
			case ('goal1legend'): $(document).find('#goal2legend').attr('class','goalDesc');
				break;
			case ('goal2legend'): ;			
				break;
			case ('goal3'): ;
				break;
			case ('goal4'): ;
				break;
			case ('goal5'): ;
				break;
			case ('goal6'): ;
				break;
			case ('goal7'): ;
				break;
			case ('goal8'): ;
				break;
			case ('goal9'): ;
				break;
			case ('goal10'): ;
				break;
			default: ;
		}
				
	}
	
//Build Legend
function legendBuild() {
	if($.Goal1.Description !== 'Goal 1' && $.Goal1.DayDate.length !== 0) 
		return;
	}
	
//Handle "Add Goal" button on Legend
function legendAddGoal_btnHandler() 
	{
			//find next goal
		    legendFindNextGoal();
			alert('Next Goal:' + $.CurrentUserSettings.NextGoal);
			
			//Activate the next goal
			$["Goal"+$.CurrentUserSettings.NextGoal].Active = 1
			console.log($["Goal1"].Active);		
				
			//call function to add next goal html to the legend
			legendAddGoal($.CurrentUserSettings.NextGoal);
						
			//dynamically update the HTML just added with goal info stored in DB
			updateLegendHTML();
			
			//update the databases
			updateDB_Goal('goal' + $.CurrentUserSettings.NextGoal);
			
		    //Apply markup to the dynamically added button
			$('#btnDropGoal' + $.CurrentUserSettings.NextGoal).buttonMarkup();
			$('#btnClearGoal' + $.CurrentUserSettings.NextGoal).buttonMarkup();
			$('#btnEditGoal' + $.CurrentUserSettings.NextGoal).buttonMarkup();
			
			//increment Next Goal
			$.CurrentUserSettings.NextGoal = $.CurrentUserSettings.NextGoal + 1;
			
			//hide then show the legend to fix the bug of the newly added goal divs not showing
			$('#legend').toggle();
			$('#legend').toggle();
			
	}
function legendAddGoal(goalNum)
	{
		$("#legend").append('<div class="legendLine" id="legendLine' + goalNum + '"><div class="goalDesc" onClick="setGoal('+ goalNum +');" id="goal'+ goalNum +'"><div class="goalDot blue" id="legendDotGoal'+ goalNum + '"></div><div class="goalText" id="goal' + goalNum + 't">Goal</div></div><a href="#popupClearGoal" id="btnClearGoal'+ goalNum + '" data-position-to="window" data-rel="popup" data-role="button" data-transition="pop" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-theme="b" aria-haspopup="true" aria-owns="#popupClearGoal" onClick="setGoal(' + goalNum + ')" style="margin-top:6px; margin-bottom:6px">Clear</a>&nbsp&nbsp<a href="#popupUpdateGoals" id="btnEditGoal'+goalNum+'" data-position-to="window" data-rel="popup" data-role="button" data-transition="pop" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-theme="b" onClick="setSelectedGoal('+ goalNum +')"> &nbspEdit&nbsp </a>&nbsp&nbsp<a href="#popupDropGoal" id="btnDropGoal'+ goalNum + '" data-rel="popup" data-position-to="window" data-overlay-theme="a" data-role="button" data-transition="pop" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-theme="b" aria-haspopup="true" aria-owns="#popupDropGoal" onClick="setSelectedGoal('+goalNum+')" style="margin-top:6px; margin-bottom:6px">&nbspDrop&nbsp</a></div>');
	}
	
function legendAddGoals_OnStartup() 
	{
		for(var i=1;i<11;i++)
		{
			if ($["Goal"+i].Active === 1)
			{
				legendAddGoal(i);
				//console.log("Adding goal:" + "Goal" + i);
			}
		}
	}

//function to update goal information entered into the update goals dialog		
function updateGoalInfo(goalNum)
	{		
		//For testing:
		//alert(goalNum);
		//alert(updatedDescription);
		
		//reload Xs for selected goal if color changed
	 	if($["Goal"+goalNum].XColor !== document.forms["frmGoals"]["XColor"].value)
 			{
 				alert("Color changed, redrawing");
 				$["Goal"+goalNum].XColor = document.forms["frmGoals"]["XColor"].value;
 				//empty the divs of the Xs that are drawn, so that they can be redrawn (for color changes)
				$("[id=" + goalNum + "dot]").empty();	
 				loadXs(goalNum);					 				
 			}
 			
 		//update the goal object in memory	
 		$["Goal"+goalNum].Description = document.forms["frmGoals"]["goalName"].value;
 		$["Goal"+goalNum].Notes = document.forms["frmGoals"]["goalNote"].value;
 		$["Goal"+goalNum].XGoal = document.forms["frmGoals"]["goalX"].value;
		
		//update the databases
		updateDB_Goal(goalNum);
		
		//update the HTML currently being displayed in the goal legend
		updateLegendHTML();		
		
		//set the goal to the currently updated goal
		setGoal(goalNum);		
		
		//test
		//alert('Current Goal Updated:' + goalNum + '      Color:' + document.forms["frmGoals"]["XColor"].value);
			
	}
	

function updateLegendHTML()
	{
			//update the HTML being displayed in the goal legend using goal info stored in DB
			for(var i=1;i<11;i++)	
				$('#goal'+i+'t').html($["Goal"+i].Description);
				
			//update the colors displayed in the legend
			for(var i=1;i<11;i++)
				$('#legendDotGoal'+i).css("background",$["Goal"+i].XColor);
	}	
			
//Not Active, delete if not used
function legendRecalcSortOrder() 
	{
		If($.CurrentUserSettings.SelectedGoal === 1)
			{
				$.Goal1.SortOrder = 10;
				$.Goal2.SortOrder -= 1;
				$.Goal3.SortOrder -= 1;
				$.Goal4.SortOrder -= 1;
				$.Goal5.SortOrder -= 1;
				$.Goal6.SortOrder -= 1;
				$.Goal7.SortOrder -= 1;
				$.Goal8.SortOrder -= 1;
				$.Goal9.SortOrder -= 1;
				$.Goal10.SortOrder -= 1;
			}
		If($.CurrentUserSettings.SelectedGoal === 2)
			$.Goal2.SortOrder = $.Goal2.SortOrder + 10;	
		If($.CurrentUserSettings.SelectedGoal === 3)
			$.Goal3.SortOrder = $.Goal3.SortOrder + 10;	
		If($.CurrentUserSettings.SelectedGoal === 4)
			$.Goal4.SortOrder = $.Goal4.SortOrder + 10;	
		If($.CurrentUserSettings.SelectedGoal === 5)
			$.Goal5.SortOrder = $.Goal5.SortOrder + 10;	
		If($.CurrentUserSettings.SelectedGoal === 6)
			$.Goal6.SortOrder = $.Goal6.SortOrder + 10;	
		If($.CurrentUserSettings.SelectedGoal === 7)
			$.Goal7.SortOrder = $.Goal7.SortOrder + 10;	
		If($.CurrentUserSettings.SelectedGoal === 8)
			$.Goal8.SortOrder = $.Goal8.SortOrder + 10;	
		If($.CurrentUserSettings.SelectedGoal === 9)
			$.Goal9.SortOrder = $.Goal9.SortOrder + 10;	
		If($.CurrentUserSettings.SelectedGoal === 10)
			$.Goal10.SortOrder = $.Goal10.SortOrder + 10;
		//update the databases
		updateDB_Goal($.CurrentUserSettings.SelectedGoal)												
	}
	
function legendFindNextGoal() 
	{
		for(var i=1;i<11;i++)
		{
			if($["Goal"+i].Active === 0) 
			{
				$.CurrentUserSettings.NextGoal = i;
			}
		} 
	}
	
function legendRemoveGoal() 
	{		
			//remove drawn calendar Xs
			unloadXs($.CurrentUserSettings.SelectedGoal);
			
			//reset goal object to default settings
			$("#legendLine"+$.CurrentUserSettings.SelectedGoal).empty().remove();
			$["Goal"+$.CurrentUserSettings.SelectedGoal].Active = 0;
			$["Goal"+$.CurrentUserSettings.SelectedGoal].SortOrder = $.Goal1.SortOrder + 10;	
			$["Goal"+$.CurrentUserSettings.SelectedGoal].Description = 'Goal';
			$["Goal"+$.CurrentUserSettings.SelectedGoal].Notes = '';
			$["Goal"+$.CurrentUserSettings.SelectedGoal].XGoal = '30';
			$["Goal"+$.CurrentUserSettings.SelectedGoal].DayDate = [];	
			$["Goal"+$.CurrentUserSettings.SelectedGoal].XColor = $.CurrentUserSettings.defaultGoalColor[$.CurrentUserSettings.SelectedGoal];	

			//update DB
			updateDB_Goal($.CurrentUserSettings.SelectedGoal);	
			
			//reset current goal to first active goal
			$.CurrentUserSettings.SelectedGoal == 1	
	}

function setGoal(goalNum)
{
		//alert('Setting Goal:' + goalNum);
		//revert all classes to normal:  'goalDesc'
		for(var i=1;i<11;i++)
			$(document).find('#goal'+i).attr('class', 'goalDesc');
		
		//change the class of the selected Goal Div to selected: 'goalDescSelected'
		$('#goal'+ goalNum).attr('class', 'goalDescSelected');
		
		//store the new selected goal in the global user settings variable
		$.CurrentUserSettings.SelectedGoal = goalNum;
		
		//update the edit goal form
		document.forms["frmGoals"]["goalName"].value = $["Goal"+goalNum].Description;
		document.forms["frmGoals"]["goalNote"].value = $["Goal"+goalNum].Notes;
		document.forms["frmGoals"]["goalX"].value = $["Goal"+goalNum].XGoal;
		$("#XColor").spectrum("set", $["Goal"+goalNum].XColor);
		
		//Set the X drawing location
		$.CurrentUserSettings.DrawDotDiv = ('#goal' + goalNum + 'dot');
		
		//Set the current color for drawing Xs to the current Xcolor of the selected goal
		$.CurrentUserSettings.DrawColor = $["Goal" + goalNum].XColor;	
}

function drawX(clickedDayDiv) 
{
	var ClickedDate = $(clickedDayDiv).attr('data-date');
	//find the correct DOM ojbect (NOT a jQuery object!) to feed to the drawing functions
	var DrawDotDivDOM =  $(clickedDayDiv).find($.CurrentUserSettings.DrawDotDiv)[0];
	var DayDBLocation = checkDay(ClickedDate);
	//console.log("Drawing Date:" + ClickedDate);
	//alert("Drawing X, current selected goal:" + $.CurrentUserSettings.SelectedGoal);
	if (DayDBLocation < 0)
		{
			//alert('Day not already used, drawing X');
			//insert day into DB
			//alert('Calling insertDay() with currentl selected goal:' + $.CurrentUserSettings.SelectedGoal);
			insertDay(ClickedDate);
			
			//draw the X
			if(Modernizr.svg) 
			{
				//empty any leftover SVG segments from the DIV so that it does not affect the new X
				$(clickedDayDiv).find($.CurrentUserSettings.DrawDotDiv).empty();
			    drawXsvg(DrawDotDivDOM, $.CurrentUserSettings.DrawColor);
			} else{
				  drawXcanvas(DrawDotDivDOM,$.CurrentUserSettings.DrawColor);
			  	  }
			   
		} else 
			{
				//alert('Day already used, erasing X');
				
				//remove day from DB
				removeDay(ClickedDate, DayDBLocation);
				
				//undraw the X
				$(clickedDayDiv).find($.CurrentUserSettings.DrawDotDiv).empty();
				unDrawXsvg(DrawDotDivDOM, $.CurrentUserSettings.DrawColor);
			}
		switch (true) {
			case ($.CurrentUserSettings.Count === 30):  window.alert("Over a month?! You fucking rock!");
				break;
			case $.CurrentUserSettings.Count === 20:  window.alert("20 days? That's actually impressive.  No, really!");
				break;
			case $.CurrentUserSettings.Count === 10:  window.alert("10 days? Well, I've seen worse...");
				break;
			case $.CurrentUserSettings.Count === 5:  window.alert("5 down! It's a start...!");
				break;		
		}
		$.CurrentUserSettings.Count++;
}

/////////////////////////////
//Form functions
/////////////////////////////
function validateGoalsForm()
	{
	var x=document.forms["frmGoals"]["goalName"].value;
	if (x.length === 20)
	  {
	  alert("Sorry! Goal name must be 20 chars. or less");
	  return false;
	  }	else {
		  	//if everything validates then update goal info
		  	updateGoalInfo();
	  }
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
	
	function getMonthLength(month)
		{
			// these are the days of the week for each month, in order
			var calDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];	
			var monthLength;
			
			if (month === 2) // February only!
			{ 
				if (($.CurrentUserSettings.SelectedYear % 4 === 0 && $.CurrentUserSettings.SelectedYear % 100 !== 0) || $.CurrentUserSettings.SelectedYear % 400 === 0){
					monthLength = 29;
				} else {
					monthLength = 28;
				}
			} else {
						monthLength = calDaysInMonth[(month - 1)];
			}
			//alert('Month Length:' + monthLength);
			return monthLength;
		}
		
	//useful function for finding presence of value in an array, returns true if present, false if not
	$.findInArray = function(arr,obj) {
			return (arr.indexOf(obj) !== -1);
	}
						
	//set currently selected goal
	function setSelectedGoal(goalNum)
	{
		$.CurrentUserSettings.SelectedGoal = goalNum;
		document.forms["frmGoals"]["goalName"].value = $["Goal"+goalNum].Description;
		document.forms["frmGoals"]["goalNote"].value = $["Goal"+goalNum].Notes;
		document.forms["frmGoals"]["goalX"].value = $["Goal"+goalNum].XGoal;
		$("#XColor").spectrum("set", $["Goal"+goalNum].XColor);
	}

	//Sort goals
	function sortGoals()
	{
		var goalsSorted = [];
		for (var i=1;i<11;i++)
		{
			var propertyName = "Goal" + i;
			goalsSorted[i-0] = $[propertyName].SortOrder;
		}				
		goalsSorted.sort(function(a,b){return a-b});
		console.log(goalsSorted);
		
		return 1;
	}