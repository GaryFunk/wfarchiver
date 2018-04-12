//WFArchibver
//Copyright © 2018 Gary W Funk
//V1.1.1

const dgram = require('dgram');
const fs = require('fs');
const mysql = require('mysql');
const schedule = require('node-schedule');

const version = '1.1.1';
const port = 50222;
const opts = {type: 'udp4', reuseAddr: true};
const socket = dgram.createSocket(opts);
const cr = '\n';
const baseDir = '/home/pi/wfarchiver/';

var tzoffset = (new Date()).getTimezoneOffset() * 60000;
//var configOk = {};
//var config = JSON.stringify(configObj);
//var configObj = JSON.parse(config);
//fs.writeFileSync('config.json', config);
//var config = fs.readFileSync('config.json');


var sql;
var mysql_config = {
    host: 'localhost',
    port: 3306,
    user: 'wf',
    password: 'weatherflow',
    database: 'weatherflow'
};
var DeviceData = {};

var timerH = schedule.scheduleJob('0 * * * *', function(){
	tzoffset = (new Date()).getTimezoneOffset() * 60000;
	fs.appendFile(baseDir + 'archive.log', logDate() + ' WFArchiver is running' + cr, (err) => {
		if (err) console.log(err);
	});
});

fs.appendFile(baseDir + 'archive.log', '====================' + cr, (err) => {
	if (err) console.log(err);
});

fs.appendFile(baseDir + 'archive.log', logDate() + ' Starting WFArchiver v' + version + cr, (err) => {
	if (err) console.log(err);
});

sqlConnect();

socket.bind(port);

socket.on('error', (err) => {
	fs.appendFile(baseDir + 'archive.log', logDate() + ` Socket error: ${err.stack}` + cr, (err) => {
		if (err) console.log(err);
	});
	socket.close();
});

socket.on('message', function (data, info, error){
	if (error) {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Message ' + error.message + cr, (err) => {
			if (err) console.log(err);
		});
	} else {
	    ProcessUDPData(data);
	}
});

socket.on('listening', function(error) {
	if (error) {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Listening: ' + error.message + cr, (err) => {
			if (err) console.log(err);
		});
	} else {
	    var address = socket.address();
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Listening on: ' + address.address + ':' + address.port + cr, (err) => {
			if (err) console.log(err);
		});
	}
});

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    onExit(3);
});

process.on('SIGTERM', function() {
    console.log("Caught termanate signal");
    onExit(4);
});

process.on('beforeExit', function(code) {
	console.log('BeforeExit: ' + code);
	var pkg = "text.txt";
	fs.readFile(pkg, function(err, data) {
		if (err) {
			console.log('error reading dummy file');
			process.exitCode = 5;
		} else {
			console.log('File okay');
			process.exitCode = 0;
		}
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Exit ' + process.exitCode + cr, (err) => {
			if (err) console.log(err);
			process.exit();
		});
	});
});

process.on('exit', function(code) {
	console.log("Exit: " + code);
});

sql.on('error', function(err) {
	fs.appendFile(baseDir + 'archive.log', logDate() + ' MariaDB (2): ' + err + cr, (err) => {
		if (err) console.log(err);
	});
	if(err.code === 'PROTOCOL_CONNECTION_LOST') {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' MariaDB (3): ' + err + cr, (err) => {
			if (err) console.log(err);
		});
		setTimeout(sqlConnect, 2000);
	} else if(err.code === 'ECONNRESET') {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' MariaDB (4): ' + err + cr, (err) => {
			if (err) console.log(err);
		});
		setTimeout(sqlConnect, 2000);
	} else {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' MariaDB (5): ' + err + cr, (err) => {
			if (err) console.log(err);
		});
		console.log(err);
	}
});


function logDate() {
	return (new Date(Date.now() - tzoffset)).toISOString().replace(/T/, ' ').replace(/\..+/, ''); 
}

function hubDate(time) {
	return (new Date((time * 1000) - tzoffset)).toISOString().replace(/T/, ' ').replace(/\..+/, ''); 
}

function onExit(code) {
	console.log("Do some exit stuff!");
	sqlExit();
	udpExit();
	schExit();
	process.exitCode = code;
}

function sqlConnect() {
	try {
		//https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
		sql = mysql.createConnection(mysql_config);
		sql.connect(function(err) {
			if(err) {
				fs.appendFile(baseDir + 'archive.log', logDate() + ' MariaDB (1): ' + err + cr, (err) => {
					if (err) console.log(err);
				});
				setTimeout(sqlConnect, 2000);
			} else {
//				console.log('  Rename table RainEvent');
//				sql.query("RENAME TABLE RainEvent TO PrecipEvent", function(error) {
//					if (error) {
//						console.log(error.code);
//						return -1;
//					} else {
//						console.log('	Table `RainEvent` renamed');
//					}
//				});
			}
		});
	}
	catch(e) {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Error in sqlConnect\n', (err) => {
			if (err) console.log(err);
		});
		return;
	};
}

function schExit() {
	timerH.cancel();
	fs.appendFile(baseDir + 'archive.log', logDate() + ' Closed timers ' + cr, (err) => {
		if (err) console.log(err);
	});
}

function sqlExit() {
	sql.end(function (err) {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Closed SQL ' + cr, (err) => {
			if (err) console.log(err);
		});
	});
}

function udpExit() {
	socket.close(function (err) {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Closed UDP ' + cr, (err) => {
			if (err) console.log(err);
		});
	});
}

function ProcessUDPData(data) {
	try {
		var J = JSON.parse(data);
	}
	catch(e) {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Error in ProcessUDPData\n', (err) => {
			if (err) console.log(err);
		});
		return;
	};
	switch (J.type) {
		case 'hub_status':
			insertHubStatus(J);
			break;
		case 'device_status':
			insertDeviceStatus(J);
	   		break;
		case 'obs_air':
			insertObsAir(J);
	   		break;
		case 'obs_sky':
			insertObsSky(J);
	   		break;
	   	case 'evt_precip':
	   		insertPrecipEvent(J);
	   		break;
	   	case 'evt_strike':
	   		insertStrikeEvent(J);
	   		break;
	   	case 'rapid_wind':
	   		insertRapidWind(J);
	   		break;
	   	case 'light_debug':
	   		break;
	   	case 'rain_debug':
	   		break;
	   	case 'wind_debug':
	   		break;
	   	default:
	   		console.log(logDate() + ' ' + J.type + ' skipping');
			fs.appendFile(baseDir + 'archive.log', logDate() + ' ' + J.type + ' skipping\n', (err) => {
				if (err) console.log(err);
			});
	}
}

function insertDeviceStatus(J) {
	try {
		if (J.serial_number in DeviceData) {
			if (DeviceData[J.serial_number]['uptime'] > J.uptime || (DeviceData[J.serial_number]['sensor'] > 0 && DeviceData[J.serial_number]['sensor'] != 4) ) {
				sql.query('INSERT INTO DeviceEvents (datetime, serial_number, type, hub_sn, timestamp, uptime, voltage, firmware_revision, rssi, hub_rssi, sensor_status, debug) SELECT datetime, serial_number, type, hub_sn, timestamp, uptime, voltage, firmware_revision, rssi, hub_rssi, sensor_status, debug FROM DeviceStatus WHERE id = ?', [DeviceData[J.serial_number]['id']], function(error) {
				    if (error) {
						fs.appendFile(baseDir + 'archive.log',logDate() + ' Error(b): ' + error.message + cr, (err) => {
							if (err) console.log(err);
						});
				    }
				});
				sql.query('INSERT INTO DeviceEvents (datetime, serial_number, type, timestamp, uptime, firmware_revision, rssi, reset_flags, stack, seq, fs) VALUES(?)', [values], function(error) {
				    if (error) {
						fs.appendFile(baseDir + 'archive.log',logDate() + ' Error(b): ' + error.message + cr, (err) => {
							if (err) console.log(err);
						});
				    }
				});
			}
		} else {
			DeviceData[J.serial_number] = {'id': 0, 'uptime': 0, 'sensor': 0};
			sql.query('SELECT id, uptime, sensor_status FROM DeviceStatus WHERE serial_number = ? ORDER BY id DESC LIMIT 1', [J.serial_number], function(error, results, fields) {
				DeviceData[J.serial_number]['id'] = results[0]['id'];
				DeviceData[J.serial_number]['uptime'] = results[0]['uptime'];
				DeviceData[J.serial_number]['sensor'] = results[0]['sensor_status'];
//				console.log('D1');
//				console.log(DeviceData);
				insertDeviceStatus(J);
				return;
			});
		}
		var values = [hubDate(J.timestamp),J.serial_number, J.type, J.hub_sn, J.timestamp, J.uptime, J.voltage, J.firmware_revision, J.rssi, J.hub_rssi, J.sensor_status, J.debug];
		sql.query('INSERT INTO DeviceStatus (datetime, serial_number, type, hub_sn, timestamp, uptime, voltage, firmware_revision, rssi, hub_rssi, sensor_status, debug) VALUES(?)', [values], function(error) {
		    if (error) {
				fs.appendFile(baseDir + 'archive.log',logDate() + ' Error(a): ' + error.message + cr, (err) => {
					if (err) console.log(err);
				});
		    } else {
				sql.query('SELECT id FROM DeviceStatus WHERE serial_number = ? ORDER BY id DESC LIMIT 1', [J.serial_number], function(error, results, fields) {
					DeviceData[J.serial_number]['id'] = results[0]['id'];
				});
		    }
		});
		DeviceData[J.serial_number]['uptime'] = J.uptime;
		DeviceData[J.serial_number]['sensor'] = J.sensor_status;
//		console.log('D2');
//		console.log(DeviceData);
	}
	catch(e) {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Error in insertDeviceStatus\n', (err) => {
			if (err) console.log(err);
		});
		return;
	};
}

function insertHubStatus(J) {
	try {
		var values = [hubDate(J.timestamp),J.serial_number, J.type, J.timestamp, J.uptime, J.firmware_revision, J.rssi, J.reset_flags, J.stack, J.seq, J.fs];
		if (J.serial_number in DeviceData) {
			if (DeviceData[J.serial_number]['uptime'] > J.uptime || DeviceData[J.serial_number]['firmware'] != J.firmware_revision) {
				sql.query('INSERT INTO HubEvents (datetime, serial_number, type, timestamp, uptime, firmware_revision, rssi, reset_flags, stack, seq, fs) SELECT datetime, serial_number, type, timestamp, uptime, firmware_revision, rssi, reset_flags, stack, seq, fs FROM HubStatus WHERE id = ?', [DeviceData[J.serial_number]['id']], function(error) {
				    if (error) {
						fs.appendFile(baseDir + 'archive.log',logDate() + ' Error(b): ' + error.message + cr, (err) => {
							if (err) console.log(err);
						});
				    }
				});
				sql.query('INSERT INTO HubEvents (datetime, serial_number, type, timestamp, uptime, firmware_revision, rssi, reset_flags, stack, seq, fs) VALUES(?)', [values], function(error) {
				    if (error) {
						fs.appendFile(baseDir + 'archive.log',logDate() + ' Error(b): ' + error.message + cr, (err) => {
							if (err) console.log(err);
						});
				    }
				});
			}
		} else {
			DeviceData[J.serial_number] = {'id': 0, 'uptime': 0, 'firmware': '0'};
			sql.query('SELECT id, uptime, firmware_revision FROM HubStatus WHERE serial_number = ? ORDER BY id DESC LIMIT 1', [J.serial_number], function(error, results, fields) {
				DeviceData[J.serial_number]['id'] = results[0]['id'];
				DeviceData[J.serial_number]['uptime'] = results[0]['uptime'];
				DeviceData[J.serial_number]['firmware'] = results[0]['firmware_revision'];
//				console.log('D1');
//				console.log(DeviceData);
				insertHubStatus(J);
				return;
			});
		}
		sql.query('INSERT INTO HubStatus (datetime, serial_number, type, timestamp, uptime, firmware_revision, rssi, reset_flags, stack, seq, fs) VALUES(?)', [values], function(error) {
		    if (error) {
				fs.appendFile(baseDir + 'archive.log',logDate() + ' Error(b): ' + error.message + cr, (err) => {
					if (err) console.log(err);
				});
		    } else {
				sql.query('SELECT id FROM HubStatus WHERE serial_number = ? ORDER BY id DESC LIMIT 1', [J.serial_number], function(error, results, fields) {
					DeviceData[J.serial_number]['id'] = results[0]['id'];
				});
		    }
		});
		DeviceData[J.serial_number]['uptime'] = J.uptime;
		DeviceData[J.serial_number]['firmware'] = J.firmware_revision;
//		console.log('D2');
//		console.log(DeviceData);
	}
	catch(e) {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Error in insertHubStatus\n', (err) => {
			if (err) console.log(err);
		});
		return;
	};
}

function insertObsAir(J) {
	try {
		var values = [hubDate(J.obs[0][0]),J.serial_number, J.type, J.hub_sn, J.firmware_revision, J.obs[0][0], J.obs[0][1], J.obs[0][2], J.obs[0][3], J.obs[0][4], J.obs[0][5], J.obs[0][6], J.obs[0][7]];
		sql.query('INSERT INTO AirObservation (datetime, serial_number, type, hub_sn, firmware_revision, timestamp, pressure, air_temperature, relative_humidity, strike_count, strike_distance, battery, report_interval) VALUES(?)', [values], function(error) {
		    if (error) {
				fs.appendFile(baseDir + 'archive.log',logDate() + ' Error(c): ' + error.message + cr, (err) => {
					if (err) console.log(err);
				});
		    }
		});
	}
	catch(e) {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Error in insertObsAir\n', (err) => {
			if (err) console.log(err);
		});
		return;
	};
}

function insertObsSky(J) {
	try {
		var values = [hubDate(J.obs[0][0]),J.serial_number, J.type, J.hub_sn, J.firmware_revision, J.obs[0][0], J.obs[0][1], J.obs[0][2], J.obs[0][3], J.obs[0][4], J.obs[0][5], J.obs[0][6], J.obs[0][7], J.obs[0][8], J.obs[0][9], J.obs[0][10], J.obs[0][11], J.obs[0][12], J.obs[0][13]];
		sql.query('INSERT INTO SkyObservation (datetime, serial_number, type, hub_sn, firmware_revision, timestamp, illuminance, uv, rain_accumulated, wind_lull, wind_avg, wind_gust, wind_direction, battery, report_interval, solar_radiation, daily_rain_accumulation, precip_type, wind_interval) VALUES(?)', [values], function(error) {
		    if (error) {
				fs.appendFile(baseDir + 'archive.log',logDate() + ' Error(d): ' + error.message + cr, (err) => {
					if (err) console.log(err);
				});
		    }
		});
	}
	catch(e) {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Error in insertObsSky\n', (err) => {
			if (err) console.log(err);
		});
		return;
	};
}

function insertPrecipEvent(J) {
	try {
		var values = [hubDate(J.evt[0]),J.serial_number, J.type, J.hub_sn, J.evt[0]];
		sql.query('INSERT INTO PrecipEvent (datetime, serial_number, type, hub_sn, timestamp) VALUES(?)', [values], function(error) {
		    if (error) {
				fs.appendFile(baseDir + 'archive.log',logDate() + ' Error(e): ' + error.message + cr, (err) => {
					if (err) console.log(err);
				});
		    }
		});
	}
	catch(e) {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Error in insertPrecipEvent\n', (err) => {
			if (err) console.log(err);
		});
		return;
	};
}

function insertRapidWind(J) {
	try {
		var values = [hubDate(J.ob[0]),J.serial_number, J.type, J.hub_sn, J.ob[0], J.ob[1], J.ob[2]];
		sql.query('INSERT INTO RapidWind (datetime, serial_number, type, hub_sn, timestamp, wind_speed, wind_direction) VALUES(?)', [values], function(error) {
		    if (error) {
				fs.appendFile(baseDir + 'archive.log',logDate() + ' Error(f): ' + error.message + cr, (err) => {
					if (err) console.log(err);
				});
		    }
		});
	}
	catch(e) {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Error in insertRapidWind\n', (err) => {
			if (err) console.log(err);
		});
		return;
	};
}

function insertStrikeEvent(J) {
	try {
		var values = [hubDate(J.evt[0]),J.serial_number, J.type, J.hub_sn, J.evt[0], J.evt[1], J.evt[2]];
		sql.query('INSERT INTO StrikeEvent (datetime, serial_number, type, hub_sn, timestamp, distance, energy) VALUES(?)', [values], function(error) {
		    if (error) {
				fs.appendFile(baseDir + 'archive.log',logDate() + ' Error(g): ' + error.message + cr, (err) => {
					if (err) console.log(err);
				});
		    }
		});
	}
	catch(e) {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Error in insertStrikeEvent\n', (err) => {
			if (err) console.log(err);
		});
		return;
	};
}
