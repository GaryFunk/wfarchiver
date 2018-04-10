//WFArchibver
//Copyright © 2018 Gary W Funk

const fs = require('fs');
const mysql = require('mysql');

const cr = '\n';
const baseDir = '/home/pi/wfarchiver/';

var mysql_config = {
	host: 'localhost',
	port: 3306,
	user: 'wf',
	password: 'weatherflow',
    database: 'weatherflow'
};

var sql;
var cf = 1;
var device = -1;
var tzoffset = (new Date()).getTimezoneOffset() * 60000;
var dates = {};
var doDate = 'today';
var serialNumbers;
var deviceData = {};

if (process.argv.length == 4 && process.argv[2] == '-date') {
	doDate = process.argv[3];
}

startApplication(1);

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


function startApplication(ap) {
	
	switch (ap) {
	case 1:
		sqlConnect();
		break;
	case 2:
		createDates();
		break;
	case 3:
		getDeviceSerialNumbers();
		break;
	case 4:
		if (device < (serialNumbers.length -1)) {
			console.log('==========');
			device++;
			cf = 1;
			getData(cf);
		} else {
			setTimeout(() => {
				startApplication(5);
			},1000);
		}
		break;
	case 5:
		sqlEnd();
		break;
	}
}
	
function getData(cf) {
	
	var sn = serialNumbers[device].serial_number;
	var theDate = dates[doDate];
	switch (cf) {
		case 1:
			deviceData = {}
			startRecord(theDate, sn);
			break;
		case 2:
			getIlluminance(theDate, sn);
			break;
		case 3:
			getUV(theDate, sn);
			break;
		case 4:
			getRainAccumulated(theDate, sn);
			break;
		case 5:
			getWindLull(theDate, sn);
			break;
		case 6:
			getWindAverage(theDate, sn);
			break;
		case 7:
			getWindGust(theDate, sn);
			break;
		case 8:
			getSolarRadiation(theDate, sn);
			break;
		case 9:
			getPrecipEvent(theDate, sn);
			break;
		case 10:
			updateRecord(theDate, sn);
		case 11:
			setTimeout(() => {
				startApplication(4);
			},1000);
	}
}

function startRecord(theDate, sn) {
	console.log('  Adding DateSerialNumber record');
	try {
		sql.query('SELECT id FROM DailySky WHERE today = ? AND serial_number = ?', [theDate, sn], function(error, results, fields) {
			if (error) {
				console.log(error);
				return -1;
			} else {
				if (results.length != 0 && 'id' in results[0]) {
					console.log('    ' + sn + ' exists');
					getData(++cf);
				} else {
					var values = [theDate, sn];
					sql.query('INSERT INTO DailySky (today, serial_number) VALUES(?)', [values], function(error) {
					    if (error) {
						    console.log(error);
							fs.appendFile(baseDir + 'archive.log',logDate() + ' Error(b): ' + error.message + cr, (err) => {
								if (err) console.log(err);
							});
						    console.log('error');
					    } else {
							console.log('    ' + sn + ' added');
							getData(++cf);
					    }
					});
				}
			}
		});
	}
	catch(e) {
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Error in DailyStats - addRecord\n', (err) => {
			if (err) console.log(err);
		});
		getData(++cf);
		return;
	};
}

function getIlluminance(theDate, sn) {
	console.log('  Query table for Illuminance');
	var dateStart = theDate + ' 00:00:00';
	var dateEnd = theDate + ' 23:59:50';
	var values = [sn, dateStart, dateEnd, sn, dateStart, dateEnd];
	var objSQL = "SELECT illuminance AS valu_h, timestamp AS valu_h_t, L.* FROM SkyObservation JOIN (SELECT illuminance AS valu_l, TIMESTAMP AS valu_l_t FROM SkyObservation WHERE serial_number = ? AND DATETIME BETWEEN ? AND ? ORDER BY illuminance ASC LIMIT 1) AS L WHERE serial_number = ? AND datetime BETWEEN ? AND ? ORDER BY illuminance DESC LIMIT 1";
	sql.query(objSQL, values, function(error, results, fields) {
		if (error) {
			console.log(error.code);
			return -1;
		} else {
			if (results.length > 0) {
				console.log('      Add data');
				deviceData.illuminance_h = results[0].valu_h;
				deviceData.illuminance_h_t = results[0].valu_h_t;
				deviceData.illuminance_h_d = "'" + hubDate(results[0].valu_h_t) + "'";
				deviceData.illuminance_l = results[0].valu_l;
				deviceData.illuminance_l_t = results[0].valu_l_t;
				deviceData.illuminance_l_d = "'" + hubDate(results[0].valu_l_t) + "'";
				getData(++cf);
			} else {
				console.log('      No Data');
				getData(++cf);
			}
		}
	});
}

function getUV(theDate, sn) {
	console.log('  Query table for UV');
	var dateStart = theDate + ' 00:00:00';
	var dateEnd = theDate + ' 23:59:50';
	var values = [sn, dateStart, dateEnd, sn, dateStart, dateEnd];
	var objSQL = "SELECT uv AS valu_h, timestamp AS valu_h_t, L.* FROM SkyObservation JOIN (SELECT uv AS valu_l, TIMESTAMP AS valu_l_t FROM SkyObservation WHERE serial_number = ? AND DATETIME BETWEEN ? AND ? ORDER BY uv ASC LIMIT 1) AS L WHERE serial_number = ? AND datetime BETWEEN ? AND ? ORDER BY uv DESC LIMIT 1";
	sql.query(objSQL, values, function(error, results, fields) {
		if (error) {
			console.log(error.code);
			return -1;
		} else {
			if (results.length > 0) {
				console.log('      Add data');
				deviceData.uv_h = results[0].valu_h;
				deviceData.uv_h_t = results[0].valu_h_t;
				deviceData.uv_h_d = "'" + hubDate(results[0].valu_h_t) + "'";
				deviceData.uv_l = results[0].valu_l;
				deviceData.uv_l_t = results[0].valu_l_t; 
				deviceData.uv_l_d = "'" + hubDate(results[0].valu_l_t) + "'";
				getData(++cf);
			} else {
				console.log('      No Data');
				getData(++cf);
			}
		}
	});
}

function getRainAccumulated(theDate, sn) {
	console.log('  Query table for RainAcccumulated');
	var dateStart = theDate + ' 00:00:00';
	var dateEnd = theDate + ' 23:59:50';
	var values = [sn, dateStart, dateEnd, sn, dateStart, dateEnd];
	var objSQL = "SELECT rain_accumulated AS valu_h, timestamp AS valu_h_t, L.* FROM SkyObservation JOIN (SELECT rain_accumulated AS valu_l, TIMESTAMP AS valu_l_t FROM SkyObservation WHERE serial_number = ? AND DATETIME BETWEEN ? AND ? ORDER BY rain_accumulated ASC LIMIT 1) AS L WHERE serial_number = ? AND datetime BETWEEN ? AND ? ORDER BY rain_accumulated DESC LIMIT 1";
	sql.query(objSQL, values, function(error, results, fields) {
		if (error) {
			console.log(error.code);
			return -1;
		} else {
			if (results.length > 0) {
				console.log('      Add data');
				deviceData.rain_accumulated_h = results[0].valu_h;
				deviceData.rain_accumulated_h_t = results[0].valu_h_t;
				deviceData.rain_accumulated_h_d = "'" + hubDate(results[0].valu_h_t) + "'";
				deviceData.rain_accumulated_l = results[0].valu_l;
				deviceData.rain_accumulated_l_t = results[0].valu_l_t;
				deviceData.rain_accumulated_l_d = "'" + hubDate(results[0].valu_l_t) + "'";
				getData(++cf);
			} else {
				console.log('      No Data');
				getData(++cf);
			}
		}
	});
}

function getWindLull(theDate, sn) {
	console.log('  Query table for WindLull');
	var dateStart = theDate + ' 00:00:00';
	var dateEnd = theDate + ' 23:59:50';
	var values = [sn, dateStart, dateEnd, sn, dateStart, dateEnd];
	var objSQL = "SELECT wind_lull AS valu_h, timestamp AS valu_h_t, L.* FROM SkyObservation JOIN (SELECT wind_lull AS valu_l, TIMESTAMP AS valu_l_t FROM SkyObservation WHERE serial_number = ? AND DATETIME BETWEEN ? AND ? ORDER BY wind_lull ASC LIMIT 1) AS L WHERE serial_number = ? AND datetime BETWEEN ? AND ? ORDER BY wind_lull DESC LIMIT 1";
	sql.query(objSQL, values, function(error, results, fields) {
		if (error) {
			console.log(error.code);
			return -1;
		} else {
			if (results.length > 0) {
				console.log('      Add data');
				deviceData.wind_lull_h = results[0].valu_h;
				deviceData.wind_lull_h_t = results[0].valu_h_t;
				deviceData.wind_lull_h_d = "'" + hubDate(results[0].valu_h_t) + "'";
				deviceData.wind_lull_l = results[0].valu_l;
				deviceData.wind_lull_l_t = results[0].valu_l_t;
				deviceData.wind_lull_l_d = "'" + hubDate(results[0].valu_l_t) + "'";
				getData(++cf);
			} else {
				console.log('      No Data');
				getData(++cf);
			}
		}
	});
}

function getWindAverage(theDate, sn) {
	console.log('  Query table for WindAverage');
	var dateStart = theDate + ' 00:00:00';
	var dateEnd = theDate + ' 23:59:50';
	var values = [sn, dateStart, dateEnd, sn, dateStart, dateEnd];
	var objSQL = "SELECT wind_avg AS valu_h, timestamp AS valu_h_t, L.* FROM SkyObservation JOIN (SELECT wind_avg AS valu_l, TIMESTAMP AS valu_l_t FROM SkyObservation WHERE serial_number = ? AND DATETIME BETWEEN ? AND ? ORDER BY wind_avg ASC LIMIT 1) AS L WHERE serial_number = ? AND datetime BETWEEN ? AND ? ORDER BY wind_avg DESC LIMIT 1";
	sql.query(objSQL, values, function(error, results, fields) {
		if (error) {
			console.log(error.code);
			return -1;
		} else {
			if (results.length > 0) {
				console.log('      Add data');
				deviceData.wind_avg_h = results[0].valu_h;
				deviceData.wind_avg_h_t = results[0].valu_h_t;
				deviceData.wind_avg_h_d = "'" + hubDate(results[0].valu_h_t) + "'";
				deviceData.wind_avg_l = results[0].valu_l;
				deviceData.wind_avg_l_t = results[0].valu_l_t;
				deviceData.wind_avg_l_d = "'" + hubDate(results[0].valu_l_t) + "'";
				getData(++cf);
			} else {
				console.log('      No Data');
				getData(++cf);
			}
		}
	});
}

function getWindGust(theDate, sn) {
	console.log('  Query table for WindGust');
	var dateStart = theDate + ' 00:00:00';
	var dateEnd = theDate + ' 23:59:50';
	var values = [sn, dateStart, dateEnd, sn, dateStart, dateEnd];
	var objSQL = "SELECT wind_gust AS valu_h, timestamp AS valu_h_t, L.* FROM SkyObservation JOIN (SELECT wind_gust AS valu_l, TIMESTAMP AS valu_l_t FROM SkyObservation WHERE serial_number = ? AND DATETIME BETWEEN ? AND ? ORDER BY wind_gust ASC LIMIT 1) AS L WHERE serial_number = ? AND datetime BETWEEN ? AND ? ORDER BY wind_gust DESC LIMIT 1";
	sql.query(objSQL, values, function(error, results, fields) {
		if (error) {
			console.log(error.code);
			return -1;
		} else {
			if (results.length > 0) {
				console.log('      Add data');
				deviceData.wind_gust_h = results[0].valu_h;
				deviceData.wind_gust_h_t = results[0].valu_h_t;
				deviceData.wind_gust_h_d = "'" + hubDate(results[0].valu_h_t) + "'";
				deviceData.wind_gust_l = results[0].valu_l;
				deviceData.wind_gust_l_t = results[0].valu_l_t;
				deviceData.wind_gust_l_d = "'" + hubDate(results[0].valu_l_t) + "'";
				getData(++cf);
			} else {
				console.log('      No Data');
				getData(++cf);
			}
		}
	});
}

function getSolarRadiation(theDate, sn) {
	console.log('  Query table for SolarRadiation');
	var dateStart = theDate + ' 00:00:00';
	var dateEnd = theDate + ' 23:59:50';
	var values = [sn, dateStart, dateEnd, sn, dateStart, dateEnd];
	var objSQL = "SELECT solar_radiation AS valu_h, timestamp AS valu_h_t, L.* FROM SkyObservation JOIN (SELECT solar_radiation AS valu_l, TIMESTAMP AS valu_l_t FROM SkyObservation WHERE serial_number = ? AND DATETIME BETWEEN ? AND ? ORDER BY solar_radiation ASC LIMIT 1) AS L WHERE serial_number = ? AND datetime BETWEEN ? AND ? ORDER BY solar_radiation DESC LIMIT 1";
	sql.query(objSQL, values, function(error, results, fields) {
		if (error) {
	    	console.log(error);
			console.log(error.code);
			return -1;
		} else {
			if (results.length > 0) {
				console.log('      Add data');
				deviceData.solar_radiation_h = results[0].valu_h;
				deviceData.solar_radiation_h_t = results[0].valu_h_t;
				deviceData.solar_radiation_h_d = "'" + hubDate(results[0].valu_h_t) + "'";
				deviceData.solar_radiation_l = results[0].valu_l;
				deviceData.solar_radiation_l_t = results[0].valu_l_t;
				deviceData.solar_radiation_l_d = "'" + hubDate(results[0].valu_l_t) + "'";
				getData(++cf);
			} else {
				console.log('      No Data');
				getData(++cf);
			}
		}
	});
}

function getPrecipEvent(theDate, sn) {
	console.log('  Query table for PrecipEvent');
	var dateStart = theDate + ' 00:00:00';
	var dateEnd = theDate + ' 23:59:50';
	var values = [sn, dateStart, dateEnd];
	var objSQL = "SELECT COUNT(id) AS valu FROM RainEvent WHERE serial_number = ? AND datetime BETWEEN ? AND ?";
	sql.query(objSQL, values, function(error, results, fields) {
		if (error) {
			console.log(error.code);
			return -1;
		} else {
			if (results.length > 0) {
				console.log('      Add data');
				deviceData.precip = results[0].valu;
				getData(++cf);
			} else {
				console.log('      No Data');
				getData(++cf);
			}
		}
	});
}


function updateRecord(theDate, sn) {
	console.log('  Updating DateSerialNumber record');
	var dateStart = theDate + ' 00:00:00';
	var dateEnd = theDate + ' 23:59:50';
	var values = [sn, dateStart, dateEnd, sn, dateStart, dateEnd];
	console.log('      Updating table');
	sqlString = 'UPDATE DailySky SET ';
	var cc = 0;
	for (key in deviceData) {
		cc++;
		sqlString += key + ' = ' + deviceData[key];
		if (cc < Object.keys(deviceData).length) {
			sqlString += ',';
		}
	}
	sqlString += ' WHERE today = ? AND serial_number = ?';
	//console.log(sqlString);
	sql.query(sqlString, [theDate, sn], function (error, results, fields) {
	    if (error) {
	    	console.log(error);
			fs.appendFile(baseDir + 'archive.log',logDate() + ' Error(b): ' + error.message + cr, (err) => {
				if (err) console.log(err);
			});
	    } else {
	    	console.log('      Wrote table');
	    }
	});
	setTimeout(() => {
		getData(++cf);
	},2000);
}

function logDate() {
	return (new Date(Date.now() - tzoffset)).toISOString().replace(/T/, ' ').replace(/\..+/, ''); 
}

function hubDate(time) {
	return (new Date((time * 1000) - tzoffset)).toISOString().replace(/T/, ' ').replace(/\..+/, ''); 
}

function sqlConnect() {
	console.log('Connecting to SQL');
	sql = mysql.createConnection(mysql_config);
	sql.connect(function(err) {
		if(err) {
			console.log('  error when connecting to db:', err);
			setTimeout(sqlConnect, 2000);
		} else {
			console.log('  Connected');
			startApplication(2);
		}									
	});
}

function createDates() {
	console.log('  Creating dates');
	var r = {};
	var d = new Date();
	var y = d.getFullYear();
	var m = d.getMonth() + 1;
	var d = d.getDate();
	dates.today = (y + '-' + ((m < 10) ? '0' + m : m) + '-' + ((d < 10) ? '0' + d : d));
	d= new Date(new Date().setDate(d-1));
	y = d.getFullYear();
	m = d.getMonth() + 1;
	d = d.getDate();
	dates.yesterday = (y + '-' + ((m < 10) ? '0' + m : m) + '-' + ((d < 10) ? '0' + d : d));
	startApplication(3);
}

function getDeviceSerialNumbers() {
	console.log('Getting DeviceSerialNumbers');
	var dateStart = dates[doDate] + ' 00:00:00';
	var dateEnd = dates[doDate] + ' 23:59:50';
	
	try {
		var values = [dateStart, dateEnd];
		sql.query('SELECT DISTINCT serial_number FROM SkyObservation WHERE datetime BETWEEN ? AND ?', values, function(error, results, fields) {
			if (error) {
				console.log(error);
				return -1;
			} else {
				if (results.length > 0 && 'serial_number' in results[0]) {
					serialNumbers = results;
				} else {
					serialNumbers = [];
				}
				startApplication(4);
			}
		});
	}
	catch(e) {
		conlole.log(e)
		fs.appendFile(baseDir + 'archive.log', logDate() + ' Error in DailyStats - getDeviceSerialNumbers\n', (err) => {
			if (err) console.log(err);
		});
		return;
	};
}

function sqlEnd() {
	if (sql) {
		console.log('Disconnecting from SQL');
		sql.end(function(err) {
			if (!err) {
				sql = null;
				console.log('  Disconnected');
				startApplication(6);
			} else {
				console.log(err);
				startApplication(6);
			}
		});
	}
}	
