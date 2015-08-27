var Windshaft   = require('windshaft');
var healthCheck = require('./healthCheck');
var driver      = require('./driver.js');

var dbUser = process.env.DRIVER_DB_USER;
var dbHost = process.env.DRIVER_DB_HOST;
var dbPort = process.env.DRIVER_DB_PORT;
var dbPassword = process.env.DRIVER_DB_PASSWORD;
var redisHost = process.env.DRIVER_REDIS_HOST;
var redisPort = process.env.DRIVER_REDIS_PORT;

var config = {
        useProfiler: true,
        // :recordtype parameter can be:
        // GEO to get the user-uploaded boundary polygon;
        // ALL to get record points of all record types; or,
        // a UUID of a particular record type (returns record points of that type)
        base_url: '/tiles/:recordtype',
        base_url_notable: '/tiles/:recordtype',
        req2params: function(req, callback) {
            try {
                req.params = driver.getRequestParameters(req.params);
                callback(null, req);
            } catch(err) {
                console.error('req2params error: ');
                console.error(err);
                callback(err, null);
            }
        },
        grainstore: {
          datasource: {
            user:dbUser,
            password: dbPassword,
            host: dbHost,
            port: dbPort,
            geometry_field: 'geom',
            // this must match the ashlar SRID set in app/driver/settings.py
            srid: 3857
          }
        }, //see grainstore npm for other options
        renderCache: {
          ttl: 60000, // seconds
        },
        mapnik: {
          metatile: 4,
          bufferSize: 64
        },
        redis: {
            host: redisHost,
            port: redisPort
        }
    };

// Initialize tile server
var ws = new Windshaft.Server(config);
ws.get('/health-check', healthCheck(config));
ws.listen(5000);
console.log("map tiles are now being served out of: http://localhost:5000"
            + config.base_url + '/:z/:x/:y.*');
