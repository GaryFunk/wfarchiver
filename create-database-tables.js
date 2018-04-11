//WFArchibver
//Copyright © 2018 Gary W Funk
//V1.0.0

const mysql = require('mysql');

var mysql_config = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: ''
};

var sql;
var db = 'weatherflow';

callFunction(1);

function callFunction(cf) {
	switch (cf) {
		case 1:
			sqlConnect();
			break;
		case 2:
			createDatabase(db);
			break;
		case 3:
			createUser(db);
			break;
		case 4:
			console.log('Creating tables');
			createAirObservation(db);
			break;
		case 5:
			createDeviceStatus(db);
			break;
		case 6:
			createHubStatus(db);
			break;
		case 7:
			createPrecipEvent(db);
			break;
		case 8:
			createRapidWind(db);
			break;
		case 9:
			createSkyObservation(db);
			break;
		case 10:
			createStrikeEvent(db);
			break;
		case 11:
			createDailyAir(db);
			break;
		case 12:
			createDailySky(db);
			break;
		case 13:
			sqlEnd(db);
			break;
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
			callFunction(2);
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

function createDatabase(db) {
	console.log('Creating database');
	sql.query('CREATE DATABASE `' + db + '`', function(error) {
		if (error) {
			if (error.code === 'ER_DB_CREATE_EXISTS') {
				console.log('  Database `' + db + '` exists!');
			} else {
				console.log(error.code);
				return -1;
			}
		} else {
			console.log('  Database `test` created');
		}
		callFunction(3);
	});
}

function createUser(db) {
	console.log('Creating user');
	sql.query("GRANT ALL PRIVILEGES ON `" + db + "`.* TO 'wf'@'%' IDENTIFIED BY 'weatherflow';", function(error) {
		if (error) {
			if (error.code === 'ER_CANNOT_USER') {
				console.log('  User `wf` failed!');
				return -1;
			} else if (error.code === 'ER_DBACCESS_DENIED_ERROR') {
					console.log('  User `wf` failed. Access denied!');
			} else {
			console.log(error.code);
				return -1;
			}
		} else {
			console.log('  User `wf` created');
		}
		callFunction(4);
	});
}

function createAirObservation(db) {
	console.log('  Creating table AirObservation');
	sql.query("CREATE TABLE `" + db + "`.`AirObservation` (`id` int(11) NOT NULL AUTO_INCREMENT,`datetime` DATETIME DEFAULT NULL,`serial_number` char(12) DEFAULT NULL,`type` varchar(12) DEFAULT NULL,`hub_sn` char(21) DEFAULT NULL,`firmware_revision` char(3) DEFAULT NULL,`timestamp` int(11) DEFAULT NULL,`pressure` decimal(5,1) DEFAULT NULL,`air_temperature` decimal(5,2) DEFAULT NULL,`relative_humidity` tinyint(3) DEFAULT NULL,`strike_count` smallint(3) DEFAULT NULL,`strike_distance` smallint(3) DEFAULT NULL,`battery` decimal(4,3) DEFAULT NULL,`report_interval` tinyint(2) DEFAULT NULL,PRIMARY KEY (`id`),KEY `serial_number` (`serial_number`),KEY `hub_sn` (`hub_sn`),KEY `timestamp` (`timestamp`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", function(error) {
		if (error) {
			if (error.code === 'ER_TABLE_EXISTS_ERROR') {
				console.log('	Table `AirObservation` exists!');
			} else {
				console.log(error.code);
				return -1;
			}
		} else {
			console.log('	Table `AirObservation` created');
		}
		callFunction(5);
	});
}

function createDeviceStatus(db) {
	console.log('  Creating table DeviceStatus');
	sql.query("CREATE TABLE `" + db + "`.`DeviceStatus` (`id` int(11) NOT NULL AUTO_INCREMENT,`datetime` DATETIME DEFAULT NULL,`serial_number` char(12) DEFAULT NULL,`type` varchar(12) DEFAULT NULL,`hub_sn` char(12) DEFAULT NULL,`timestamp` int(11) DEFAULT NULL,`uptime` int(11) DEFAULT NULL,`voltage` decimal(4,3) DEFAULT NULL,`firmware_revision` char(3) DEFAULT NULL,`rssi` tinyint(4) DEFAULT NULL,`hub_rssi` tinyint(4) DEFAULT NULL,`sensor_status` int(11) DEFAULT NULL,`debug` tinyint(1) DEFAULT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", function(error) {
		if (error) {
			if (error.code === 'ER_TABLE_EXISTS_ERROR') {
				console.log('	Table `DeviceStatus` exists!');
			} else {
				console.log(error.code);
				return -1;	
			}
		} else {
			console.log('	Table `DeviceStatus` created');
		}
		callFunction(6);
	});
}

function createHubStatus(db) {
	console.log('  Creating table HubStatus');
	sql.query("CREATE TABLE `" + db + "`.`HubStatus` (`id` int(11) NOT NULL AUTO_INCREMENT,`datetime` DATETIME DEFAULT NULL,`serial_number` varchar(12) DEFAULT NULL,`type` varchar(12) DEFAULT NULL,`timestamp` int(11) DEFAULT NULL,`uptime` int(11) DEFAULT NULL,`firmware_revision` char(3) DEFAULT NULL,`rssi` tinyint(4) DEFAULT NULL,`reset_flags` varchar(50) DEFAULT NULL,`stack` varchar(50) DEFAULT NULL,`seq` int(11) DEFAULT NULL,`fs` varchar(12) DEFAULT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", function(error) {
		if (error) {
			if (error.code === 'ER_TABLE_EXISTS_ERROR') {
				console.log('	Table `HubStatus` exists!');
			} else {
				console.log(error.code);
				return -1;
			}
		} else {
			console.log('	Table `HubStatus` created');
		}
		callFunction(7);
	});
}

function createPrecipEvent(db) {
	console.log('  Creating table PrecipEvent');
	sql.query("CREATE TABLE `" + db + "`.`PrecipEvent` (`id` int(11) NOT NULL AUTO_INCREMENT,`datetime` DATETIME DEFAULT NULL,`serial_number` char(12) DEFAULT NULL,`type` varchar(12) DEFAULT NULL,`hub_sn` char(12) DEFAULT NULL,`timestamp` int(11) DEFAULT NULL,PRIMARY KEY (`id`),KEY `serial_numner` (`serial_number`),KEY `hub_sn` (`hub_sn`),KEY `timestamp` (`timestamp`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", function(error) {
		if (error) {
			if (error.code === 'ER_TABLE_EXISTS_ERROR') {
				console.log('	Table `PrecipEvent` exists!');
			} else {
				console.log(error.code);
				return -1;
			}
		} else {
			console.log('	Table `PrecipEvent` created');
		}
		callFunction(8);
	});
}

function createRapidWind(db) {
	console.log('  Creating table RapidWind');
	sql.query("CREATE TABLE `" + db + "`.`RapidWind` (`id` int(11) NOT NULL AUTO_INCREMENT,`datetime` DATETIME DEFAULT NULL,`serial_number` char(12) DEFAULT NULL,`type` varchar(12) DEFAULT NULL,`hub_sn` char(12) DEFAULT NULL,`timestamp` int(11) DEFAULT NULL,`wind_speed` tinyint(3) DEFAULT NULL,`wind_direction` smallint(3) DEFAULT NULL,PRIMARY KEY (`id`),KEY `serial_number` (`serial_number`),KEY `hub_sn` (`hub_sn`),KEY `timestamp` (`timestamp`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", function(error) {
		if (error) {
			if (error.code === 'ER_TABLE_EXISTS_ERROR') {
				console.log('	Table `RapidWind` exists!');
			} else {
				console.log(error.code);
				return -1;
			}
		} else {
			console.log('	Table `RapidWind` created');
		}
		callFunction(9);
	});
}

function createSkyObservation(db) {
	console.log('  Creating table SkyObservation');
	sql.query("CREATE TABLE `" + db + "`.`SkyObservation` (`id` int(11) NOT NULL AUTO_INCREMENT,`datetime` DATETIME DEFAULT NULL,`serial_number` char(12) DEFAULT NULL,`type` varchar(12) DEFAULT NULL,`hub_sn` char(12) DEFAULT NULL,`firmware_revision` char(3) DEFAULT NULL,`timestamp` int(11) DEFAULT NULL,`illuminance` int(11) DEFAULT NULL,`uv` decimal(3,1) DEFAULT NULL,`rain_accumulated` decimal(9,6) DEFAULT NULL,`wind_lull` tinyint(3) DEFAULT NULL,`wind_avg` tinyint(3) DEFAULT NULL,`wind_gust` tinyint(3) DEFAULT NULL,`wind_direction` smallint(3) DEFAULT NULL,`battery` decimal(4,3) DEFAULT NULL,`report_interval` tinyint(2) DEFAULT NULL,`solar_radiation` smallint(6) DEFAULT NULL,`daily_rain_accumulation` decimal(9,6) DEFAULT NULL,`precip_type` tinyint(1) DEFAULT NULL,`wind_interval` tinyint(2) DEFAULT NULL,PRIMARY KEY (`id`),KEY `serial_number` (`serial_number`),KEY `hub_sn` (`hub_sn`),KEY `timestamp` (`timestamp`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", function(error) {
		if (error) {
			if (error.code === 'ER_TABLE_EXISTS_ERROR') {
				console.log('	Table `SkyObservation` exists!');
			} else {
				console.log(error.code);
				return -1;
			}
		} else {
			console.log('	Table `SkyObservation` created');
		}
		callFunction(10);
	});
}

function createStrikeEvent(db) {
	console.log('  Creating table StrikeEvent');
	sql.query("CREATE TABLE `" + db + "`.`StrikeEvent` (`id` int(11) NOT NULL AUTO_INCREMENT,`datetime` DATETIME DEFAULT NULL,`serial_number` char(12) DEFAULT NULL,`type` varchar(12) DEFAULT NULL,`hub_sn` char(12) DEFAULT NULL,`timestamp` int(11) DEFAULT NULL,`distance` tinyint(2) DEFAULT NULL,`energy` int(11) DEFAULT NULL,PRIMARY KEY (`id`),KEY `serial_number` (`serial_number`),KEY `hub_sn` (`hub_sn`),KEY `timespamp` (`timestamp`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", function(error) {
		if (error) {
			if (error.code === 'ER_TABLE_EXISTS_ERROR') {
				console.log('	Table `StrikeEvent` exists!');
			} else {
				console.log(error.code);
				return -1;
			}
		} else {
			console.log('	Table `StrikeEvent` created');
		}
		callFunction(11);
	});
}

function createDailyAir(db) {
	console.log('  Creating table DailyAir');
	sql.query("CREATE TABLE `" + db + "`.`DailyAir` ( `id` int(11) NOT NULL AUTO_INCREMENT, `today` date DEFAULT NULL, `serial_number` varchar(11) DEFAULT NULL, `air_temperature_h` decimal(5,2) DEFAULT NULL, `air_temperature_h_t` int(11) DEFAULT NULL, `air_temperature_h_d` datetime DEFAULT NULL, `air_temperature_l` decimal(5,2) DEFAULT NULL, `air_temperature_l_t` int(11) DEFAULT NULL, `air_temperature_l_d` datetime DEFAULT NULL, `pressure_h` decimal(5,1) DEFAULT NULL, `pressure_h_t` int(11) DEFAULT NULL, `pressure_h_d` datetime DEFAULT NULL, `pressure_l` decimal(5,1) DEFAULT NULL, `pressure_l_t` int(11) DEFAULT NULL, `pressure_l_d` datetime DEFAULT NULL, `relative_humidity_h` tinyint(3) DEFAULT NULL, `relative_humidity_h_t` int(11) DEFAULT NULL,`relative_humidity_h_d` datetime DEFAULT NULL, `relative_humidity_l` tinyint(3) DEFAULT NULL, `relative_humidity_l_t` int(11) DEFAULT NULL, `relative_humidity_l_d` datetime DEFAULT NULL, `strike` smallint(3) DEFAULT NULL, PRIMARY KEY (`id`), UNIQUE KEY `today_serial_number` (`today`,`serial_number`)) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4", function(error) {
		if (error) {
			if (error.code === 'ER_TABLE_EXISTS_ERROR') {
				console.log('	Table `StrikeEvent` exists!');
			} else {
				console.log(error.code);
				return -1;
			}
		} else {
			console.log('	Table `DailyAir` created');
		}
		callFunction(12);
	});
}

function createDailySky(db) {
	console.log('  Creating table DailySky');
	sql.query("CREATE TABLE `" + db + "`.`DailySky` ( `id` int(11) NOT NULL AUTO_INCREMENT, `today` date DEFAULT NULL, `serial_number` varchar(11) DEFAULT NULL, `illuminance_h` int(11) DEFAULT NULL, `illuminance_h_t` int(11) DEFAULT NULL, `illuminance_h_d` datetime DEFAULT NULL, `illuminance_l` int(11) DEFAULT NULL, `illuminance_l_t` int(11) DEFAULT NULL, `illuminance_l_d` datetime DEFAULT NULL, `uv_h` decimal(3,1) DEFAULT NULL, `uv_h_t` int(11) DEFAULT NULL, `uv_h_d` datetime DEFAULT NULL, `uv_l` decimal(3,1) DEFAULT NULL, `uv_l_t` int(11) DEFAULT NULL, `uv_l_d` datetime DEFAULT NULL, `rain_accumulated_h` decimal(9,6) DEFAULT NULL, `rain_accumulated_h_t` int(11) DEFAULT NULL, `rain_accumulated_h_d` datetime DEFAULT NULL, `rain_accumulated_l` decimal(9,6) DEFAULT NULL, `rain_accumulated_l_t` int(11) DEFAULT NULL, `rain_accumulated_l_d` datetime DEFAULT NULL, `wind_lull_h` tinyint(3) DEFAULT NULL, `wind_lull_h_t` int(11) DEFAULT NULL, `wind_lull_h_d` datetime DEFAULT NULL, `wind_lull_l` tinyint(3) DEFAULT NULL, `wind_lull_l_t` int(11) DEFAULT NULL, `wind_lull_l_d` datetime DEFAULT NULL, `wind_avg_h` tinyint(3) DEFAULT NULL, `wind_avg_h_t` int(11) DEFAULT NULL, `wind_avg_h_d` datetime DEFAULT NULL, `wind_avg_l` tinyint(3) DEFAULT NULL, `wind_avg_l_t` int(11) DEFAULT NULL, `wind_avg_l_d` datetime DEFAULT NULL, `wind_gust_h` tinyint(3) DEFAULT NULL, `wind_gust_h_t` int(11) DEFAULT NULL, `wind_gust_h_d` datetime DEFAULT NULL, `wind_gust_l` tinyint(4) DEFAULT NULL, `wind_gust_l_t` int(11) DEFAULT NULL, `wind_gust_l_d` datetime DEFAULT NULL, `solar_radiation_h` smallint(6) DEFAULT NULL, `solar_radiation_h_t` int(11) DEFAULT NULL, `solar_radiation_h_d` datetime DEFAULT NULL, `solar_radiation_l` smallint(6) DEFAULT NULL, `solar_radiation_l_t` int(11) DEFAULT NULL, `solar_radiation_l_d` datetime DEFAULT NULL, `precip` tinyint(3) DEFAULT NULL, PRIMARY KEY (`id`), UNIQUE KEY `today_serial_number` (`today`,`serial_number`)) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;", function(error) {
		if (error) {
			if (error.code === 'ER_TABLE_EXISTS_ERROR') {
				console.log('	Table `StrikeEvent` exists!');
			} else {
				console.log(error.code);
				return -1;
			}
		} else {
			console.log('	Table `DailyAir` created');
		}
		callFunction(13);
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
	});
}	
