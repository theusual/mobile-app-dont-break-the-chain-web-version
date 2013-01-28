// DB scripts

function checkMasterDB()
	{
		//open a new database using the openDatabase method then assign the db object as a property of the $.mobile object -- openDatabase('dbName', 'Version#', 'DisplayName', size)
		$.mobile.DBTCdb = openDatabase('DBTCdb','1.0', 'DontBreakTheChain App DB', 2*1024*1024);  
		
		//for testing only, simulate new user				
		//dropDBmaster();
																										 
		$.mobile.DBTCdb.transaction(function(t) 
			{
				//Check for existance of masterDB, if not masterDB then program is running for first time and it needs to be created
				t.executeSql('SELECT tbl_name from sqlite_master WHERE tbl_name = "masterDB";'
								,null
								,function (t,result)
									{	
										var len = result.rows.length;
										if(len > 0) {  alert('masterDB exists'); checkVersion();} //masterDB exists, run versionCheck
											else { createDBmaster();}	 //build masterDB																		
									}
								,function (t,e)
							  		{ alert('DB Error 1:' + e.message); }
								);			
			});
	}

function checkVersion()
	{
		//Check database version.  If version is different, drop the DB tables and build new ones using new schema
				alert ('App DB Ver:' + $.AppSettings.dbVersion);
			$.mobile.DBTCdb.transaction(function(t) 
			{
				t.executeSql('SELECT dbVersion from masterDB;'
								,null
								,function (t,result)
									{	
									    var row = result.rows.item(0);
										alert('checking DBs.  DB ver: ' + row.dbVersion + '   Required ver: ' + $.AppSettings.dbVersion);
										if(row.dbVersion >= $.AppSettings.dbVersion) 
											{ alert('DB ver matches');}              //dbVersion matches, so do nothing, skip DB creation. 
											else { alert('DB ver no matches:' + row.dbVersion); 
													purgeDB();
													createDB();
													}	 																
									}
								,function (t,e)
							  		{ alert('DB Error 2:' + e.message); }
								);			
			});
	}
	
function createDBmaster()
	{				
	
		alert('masterDB no existy');
		
		$.mobile.DBTCdb.transaction(function(t) 
			{
			//Create and populate masterDB table
				//Master table for storing settings regarding database state (version, etc.).  This table is only created when the program is run for the first time and is never dropped.   
				t.executeSql('CREATE TABLE IF NOT EXISTS masterDB (dbVersion REAL NOT NULL PRIMARY KEY, LastUpdated TEXT);'
								,null
								,function (t, result)
									{alert('masterDB created!');}
								,function (t,e)
							  		{ alert('DB Error 1:' + e.message); }
								);	
				//The masterDB is however updated to the latest version everytime a new createDB function is called. This prevents createDB from running again unless version is changed
				t.executeSql('INSERT INTO masterDB (dbVersion, LastUpdated) VALUES (' + $.AppSettings.dbVersion + ', datetime("now","localtime"));'
								,null
								,function (t, result)
									{alert('masterDB inserted!');}
								,function (t,e)
							  		{ alert('DB Error 1:' + e.message); }
								);	
				});

		//now that masterDB is created, create rest of database (assumption is that if masterDB did not already exist than all other tables do not exist either, no purgeDB() is needed)		
		createDB();
	}

function dropDBmaster()
	{
		//for testing only
		$.mobile.DBTCdb.transaction(function(t) 
			{
				alert('Dropping masterDB');
				t.executeSql('DROP TABLE IF EXISTS masterDB;');
			});
	}
		
	
	
function createDB()
	{				
		$.mobile.DBTCdb.transaction(function(t) 
			{
				 alert('Creating new tables');
			//Update masterDB version to current dbVersion. This prevents createDB from running again unless version is changed
				t.executeSql('UPDATE masterDB SET dbVersion = ' + $.AppSettings.dbVersion + ', LastUpdated = datetime("now","localtime");');
				
			//Create DB tables	
				
				t.executeSql('CREATE TABLE IF NOT EXISTS UserSettings (UserID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, SelectedGoal TEXT NOT NULL, SelectedGoalCount TEXT NOT NULL);');
				t.executeSql('CREATE TABLE IF NOT EXISTS Goal1Days (DayID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, DayDate TEXT NOT NULL);');
				t.executeSql('CREATE TABLE IF NOT EXISTS Goal2Days (DayID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, DayDate TEXT NOT NULL);');
				t.executeSql('CREATE TABLE IF NOT EXISTS Goal3Days (DayID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, DayDate TEXT NOT NULL);');
				t.executeSql('CREATE TABLE IF NOT EXISTS Goal4Days (DayID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, DayDate TEXT NOT NULL);');
				t.executeSql('CREATE TABLE IF NOT EXISTS Goal5Days (DayID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, DayDate TEXT NOT NULL);');
				t.executeSql('CREATE TABLE IF NOT EXISTS Goal6Days (DayID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, DayDate TEXT NOT NULL);');
				t.executeSql('CREATE TABLE IF NOT EXISTS Goal7Days (DayID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, DayDate TEXT NOT NULL);');
				t.executeSql('CREATE TABLE IF NOT EXISTS Goal8Days (DayID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, DayDate TEXT NOT NULL);');
				
				//Populate tables with starting data
				t.executeSql('INSERT INTO UserSettings (SelectedGoal, SelectedGoalCount) VALUES (1,0);');
				});
	}
	
	
function purgeDB()
	{				
		alert('Purging DB...');
		$.mobile.DBTCdb.transaction(function(t) 
			{
				//Drop DB tables
				t.executeSql('DROP TABLE IF EXISTS UserSettings;');
				t.executeSql('DROP TABLE IF EXISTS Goal1Days;');
				t.executeSql('DROP TABLE IF EXISTS Goal2Days;');
				t.executeSql('DROP TABLE IF EXISTS Goal3Days;');
				t.executeSql('DROP TABLE IF EXISTS Goal4Days;');
				t.executeSql('DROP TABLE IF EXISTS Goal5Days;');
				t.executeSql('DROP TABLE IF EXISTS Goal6Days;');
				t.executeSql('DROP TABLE IF EXISTS Goal7Days;');
				t.executeSql('DROP TABLE IF EXISTS Goal8Days;');
			});
	}
	
	
function checkDay()
	{	
	var id = $(this).attr('data-date');
	
	$.mobile.DBTCdb.transaction(function(t) 
			{
				//Check for existance of a day in the selected goal table
				t.executeSql('SELECT DayID FROM ' + $.CurrentUserSettings.DBGoalTable + ' WHERE DayDate = ' + $.CurrentUserSettings.CurrentDate + ';'
								,null
								,function (t,result)
									{	
										var len = result.rows.length;
										if(len == 1) { } //do nothing, skip DB creation}
											else { createDB();}	 //build DB																		
									}
								,function (t,e)
							  		{ alert('DB Error:' + e.message); }
								);			
			});
	}
	
function insertDay(clickedDayDiv)
	{
		//var clickedDate = $(clickedDayDiv).attr('data-date');
		var clickedDate = $(clickedDayDiv).attr('id');
		
		alert('INSERT INTO ' + $.CurrentUserSettings.DBGoalTable + ' (DayDate) VALUES (' + clickedDate + ');'   );
		
		$.mobile.DBTCdb.transaction(function(t) 
			{
				//Insert day into the appropriate goal table
				t.executeSql('INSERT INTO ' + $.CurrentUserSettings.DBGoalTable + ' (DayDate) VALUES ("' + clickedDate + '");'
								,null
								,function (t,result)
									{	
										alert('DayDate Inserted');																
									}
								,function (t,e)
							  		{ alert('DB Error:' + e.message); }
								);			
			});
	}