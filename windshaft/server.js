var Windshaft = require('windshaft');
var healthCheck = require('./healthCheck');

var dbUser = process.env.DRIVER_DB_USER;
var dbHost = process.env.DRIVER_DB_HOST;
var dbPort = process.env.DRIVER_DB_PORT;
var dbPassword = process.env.DRIVER_DB_PASSWORD;
var redisHost = process.env.DRIVER_REDIS_HOST;
var redisPort = process.env.DRIVER_REDIS_PORT;

var config = {
        useProfiler: true,
        base_url: '/tiles/database/:dbname/table/:table',
        base_url_notable: '/tiles/database/:dbname',
        req2params: function(req, callback) {
            try {
                /* CAN SET HERE THINGS LIKE:
                req.params.table
                req.params.dbname
                req.params.style
                req.params.interactivity
                */
                callback(null, req);
            } catch(err) {
                console.error('req2params error: ');
                callback(err, null);
            }
        },
        grainstore: {
          datasource: {
            user:dbUser,
            password: dbPassword,
            host: dbHost,
            port: dbPort,
            geometry_field: 'the_geom',
            srid: 4326
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