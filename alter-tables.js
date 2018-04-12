//WFArchibver
//Copyright © 2018 Gary W Funk
//V1.0.0

const mysql = require('mysql');

var mysql_config = {
    host: 'localhost',
    port: 3306,
    user: 'wf',
    password: 'weatherflow',
    database: 'weatherflow'
};


var sql;
var db = '';
var cf = 1;

console.log(process.cwd());
callFunction(cf);

function callFunction(cf) {
	switch (cf) {
		case 1:
			sqlConnect();
			break;
		case 2:
			console.log('Altering tables');
			alterAirObservation(db);
			break;
		case 3:
			alterDeviceStatus(db);
			break;
		case 4:
			alterHubStatus(db);
			break;
		case 5:
			alterRainEvent(db);
			break;
		case 6:
			alterRapidWind(db);
			break;
		case 7:
			alterSkyObservation(db);
			break;
		case 8:
			alterStrikeEvent(db);
			break;
		case 9:
			sqlEnd(db);
			break;
		case 10:
			process.exit();
	}
}

function sqlConnect() {
	console.log('Connecting to SQL');
	sql = mysql.createConnection(mysql_config);
	sql.connect(function(err) {
		if(err) {
			console.log('error when connecting to db:', err);
			setTimeout(sqlConnect, 2000);
		} else {
			console.log('  Connected');
			callFunction(cf++);
		}									
	});
	sql.on('error', function(err) {
		console.log('db error', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') {
			console.log(err.code)
			setTimeout(sqlConnect, 2000);
		} else if(err.code === 'ECONNRESET') {
			console.log(err.code)
			setTimeout(sqlConnect, 2000);
		} else {									 
			console.log(err.code);
			throw err;								 
		}
	});
}

//ADD COLUMN `datetime` DATETIME NULL AFTER `id`
//CHANGE `type` `type` VARCHAR(16) CHARSET utf8mb4 COLLATE utf8mb4_general_ci NULL
function alterAirObservation() {
	console.log('  Altering table AirObservation');
	sql.query("ALTER TABLE AirObservation CHANGE `type` `type` VARCHAR(16) CHARSET utf8mb4 COLLATE utf8mb4_general_ci NULL", function(error) {
		if (error) {
			if (error.code === 'ER_DUP_FIELDNAME') {
				console.log('	Table `AirObservation` field exists!');
			} else {
				console.log(error.code);
				return -1;
			}
		} else {
			console.log('	Table `AirObservation` altered');
		}
		callFunction(cf++);
	});
}

function alterDeviceStatus() {
	console.log('  Altering table DeviceStatus');
	sql.query("ALTER TABLE DeviceStatus CHANGE `type` `type` VARCHAR(16) CHARSET utf8mb4 COLLATE utf8mb4_general_ci NULL", function(error) {
		if (error) {
			if (error.code === 'ER_DUP_FIELDNAME') {
				console.log('	Table `DeviceStatus` field exists!');
			} else {
				console.log(error.code);
				return -1;	
			}
		} else {
			console.log('	Table `DeviceStatus` altered');
		}
		sql.query("UPDATE DeviceStatus SET TYPE = 'device_status'", function(error) {
			if (error) {
				if (error.code === 'ER_DUP_FIELDNAME') {
					console.log('	Table `DeviceStatus` field exists!');
				} else {
					console.log(error.code);
					return -1;	
				}
			} else {
				console.log('	Table `DeviceStatus` updated');
			}
			callFunction(cf++);
		});
	});
}

function alterHubStatus() {
	console.log('  Altering table HubStatus');
	sql.query("ALTER TABLE HubStatus CHANGE `type` `type` VARCHAR(16) CHARSET utf8mb4 COLLATE utf8mb4_general_ci NULL", function(error) {
		if (error) {
			if (error.code === 'ER_DUP_FIELDNAME') {
				console.log('	Table `HubStatus` field exists!');
			} else {
				console.log(error.code);
				return -1;
			}
		} else {
			console.log('	Table `HubStatus` altered');
		}
		callFunction(cf++);
	});
}

function alterRainEvent() {
	console.log('  Altering table RainEvent');
	sql.query("ALTER TABLE PrecipEvent CHANGE `type` `type` VARCHAR(16) CHARSET utf8mb4 COLLATE utf8mb4_general_ci NULL", function(error) {
		if (error) {
			if (error.code === 'ER_DUP_FIELDNAME') {
				console.log('	Table `RainEvent` field exists!');
			} else {
				console.log(error.code);
				return -1;
			}
		} else {
			console.log('	Table `RainEvent` altered');
		}
		callFunction(cf++);
	});
}

function alterRapidWind() {
	console.log('  Altering table RapidWind');
	sql.query("ALTER TABLE RapidWind CHANGE `type` `type` VARCHAR(16) CHARSET utf8mb4 COLLATE utf8mb4_general_ci NULL", function(error) {
		if (error) {
			if (error.code === 'ER_DUP_FIELDNAME') {
				console.log('	Table `RapidWind` field exists!');
			} else {
				console.log(error.code);
				return -1;
			}
		} else {
			console.log('	Table `RapidWind` altered');
		}
		callFunction(cf++);
	});
}

function alterSkyObservation() {
	console.log('  Altering table SkyObservation');
	sql.query("ALTER TABLE SkyObservation CHANGE `type` `type` VARCHAR(16) CHARSET utf8mb4 COLLATE utf8mb4_general_ci NULL", function(error) {
		if (error) {
			if (error.code === 'ER_DUP_FIELDNAME') {
				console.log('	Table `SkyObservation` field exists!');
			} else {
				console.log(error.code);
				return -1;
			}
		} else {
			console.log('	Table `SkyObservation` altered');
		}
		callFunction(cf++);
	});
}

function alterStrikeEvent() {
	console.log('  Altering table StrikeEvent');
	sql.query("ALTER TABLE StrikeEvent CHANGE `type` `type` VARCHAR(16) CHARSET utf8mb4 COLLATE utf8mb4_general_ci NULL", function(error) {
		if (error) {
			if (error.code === 'ER_DUP_FIELDNAME') {
				console.log('	Table `StrikeEvent` field exists!');
			} else {
				console.log(error.code);
				return -1;
			}
		} else {
			console.log('	Table `StrikeEvent` altered');
		}
		callFunction(cf++);
	});
}

function sqlEnd() {
	console.log('Disconnecting from SQL');
	sql.end(function(err) {
		if (!err) {
			sql = null;
			console.log('  Disconnected');
		} else {
			console.log(err);
		}
		callFunction(cf++);
	});
}	
