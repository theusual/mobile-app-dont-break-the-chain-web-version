// DB scripts

function checkDBVersion()
	{
		
		//for testing only, simulate new user				
		//purgeDB();
																								 
		//Check the dbVersion property of the stored AppSettings object, if older than current dbVersion then rebuild DB, if non existant then build DB
		
		if ($.localStorage.getObject("AppSettings") === null) 
			{
				if($.AppSettings.testing === 'true')
					alert('Local DB does not exist, building'); 
				//createDB runs at end of purge function and loadDB runs at end of createDB function, so no need to call them seperately
				purgeDB();
				
			} else if ($.localStorage.getObject("AppSettings").dbVersion < $.AppSettings.dbVersion)
				{
					if($.AppSettings.testing === 'true')
						alert('Old version: ' + $.localStorage.getObject("AppSettings").dbVersion + '   Upgrading to version: '  + $.AppSettings.dbVersion);
					//createDB runs at end of purge function and loadDB is not needed as the objects are created as part of the createDB process, so no need to call them seperately
					purgeDB();																	
				}
			 else
				{
					if($.AppSettings.testing === 'true')
						alert('Versions Match');
					//load all the stored objects into memory
					loadDB();
				}
	}
		
function purgeDB()
	{	
		if($.AppSettings.testing === 'true')
			alert('Purging DB...');
		
		//purge all stored data
		$.localStorage.clear();
		
		//rebuild
		createDB();
				
	}
	
function createDB(){
    //Update AppSettings which will update the stored dbVersion attribute to the current version. This prevents createDB from running again unless version is changed
    $.localStorage.setObject("AppSettings",$.AppSettings)

    //Create JSON objects
    //UserSettings - stores app settings related to current user
    $.UserSettings = {
        CurrentDate: $.getFormattedDate('today'),
        SelectedMonth: $.getCurrentMonth(),
        SelectedYear: $.getCurrentYear(),
        SelectedGoal: 1,
        DrawDotDiv: '#goal1dot',
        DrawDayDiv: '',
        DrawColor: '#00ffff',
        MaxCount: 0,
        defaultGoalColor: ['#FFFFFF','#06fdfd','#e50000','#f97306','#01ff07',
                           '#c9ae74','#ff028d','#F2DA00','#9a0eea','#00349B','#ffff96'],
        goalsSortOrder: [1,2,3]
    };
    //User - stores username, password, session token, rememberMe setting, and full name (if given)
    $.CurrentUser = {
        UserName: '',
        UserPassword: '',
        SessionToken: '',
        RememberMe: '',
        UserRealName: ''
        };

    //UserGoals - stores goal info for current user
    $.UserGoals = { };
    for(var i=1;i<11;i++)
        {
            $.UserGoals['Goal'+i] = {
                Description: 'Goal',
                XGoal: '30',
                Notes: '',
                DayDate: [],
                Active: 0,
                SortOrder: i,
                XColor: $.UserSettings.defaultGoalColor[i],
                LastUpdated: ''
            };
        }
    //set first 3 goals to active for a new user
    $.UserGoals.Goal1.Active = 1;
    $.UserGoals.Goal2.Active = 1;
    $.UserGoals.Goal3.Active = 1;

    //Write the newly created goal, user, and settings objects to DB
    updateDB_UserSettings();
    updateDB_CurrentUser();
    updateDB_Goals('ALL');
}
	
function loadDB(){
    //load settings object
    $.UserSettings = $.localStorage.getObject("CurrentUserSettings");
    //load goal objects
    for (var i = 1; i<11 ; i++)
            $.UserGoals["Goal"+i] = $.localStorage.getObject("Goal"+i);

    //load values that are dynamic and need to be retrieved on startup, not stored in database
    $.UserSettings.CurrentDate =  $.getFormattedDate('today');
    $.UserSettings.SelectedMonth = $.getCurrentMonth();
    $.UserSettings.SelectedYear = $.getCurrentYear();
}
	
	
function checkDay(ClickedDate) //Check for existance of the clicked day in the selected goal table
	{	
		var DateFound;
		//Search to see if the date is found in the DayDate array
		DateFound = $.UserGoals["Goal"+$.UserSettings.SelectedGoal].DayDate.indexOf(ClickedDate);
		return DateFound;
	}

	
function insertDay(ClickedDate) //Insert the clicked day into the selected goal table
	{		
		//alert('Inserting Day to DB, current goal:' + $.UserSettings.SelectedGoal);
		//update the objects
		$.UserGoals["Goal"+$.UserSettings.SelectedGoal].DayDate.push(ClickedDate);
		//update the databases
		updateDB_Goal($.UserSettings.SelectedGoal)
	}
	

function removeDay(ClickedDate, DayDBLocation) //Remove the clicked day from the selected goal table
	{			
		//update object
		$.UserGoals["Goal"+$.UserSettings.SelectedGoal].DayDate.splice(DayDBLocation,1);
		//update the databases
		updateDB_Goal($.UserSettings.SelectedGoal)				
	}
		
//function to clear goal progress for a single goal
function clearGoal(goalNum)
	{		
		//undraw calendar Xs to reflect the newly cleared goals
		unloadXs(goalNum);
		
		//clear object array(s)
		$.UserGoals["Goal"+goalNum].DayDate.length = 0;
		if(goalNum === 'ALL')
			for (var i = 1; i<11 ; i++)
				$.UserGoals["Goal"+i].DayDate.length = 0;
		//update the databases
		updateDB_Goal(goalNum)
	}

//Write back goal info to the databases, send either goal names in the form of 'goal1' or send 'ALL' to write back all goals to DB
//REPLACED BY updateDB_Goals() on 6/9/13 -- Because all goals were combined into 1 object and localstorage can only write back a parent object, can't nest them
/*function updateDB_Goal(goalNum){
     //alert('Updating goal' + goalNum);
     if(goalNum === 'ALL')
     for (var i = 1; i<11 ; i++)
     $.localStorage.setObject('Goal'+i, $.UserGoals["Goal"+i]);
     else
     $.localStorage.setObject('Goal'+goalNum, $.UserGoals["Goal"+goalNum]);
 }   */
function updateDB_Goals(){
    $.localStorage.setObject("UserGoals", $.UserGoals)
}
function updateDB_UserSettings(){
	$.localStorage.setObject("UserSettings",$.UserSettings);
}
function updateDB_CurrentUser(){
    $.localStorage.setObject("CurrentUser",$.CurrentUser);
}
