var Redis = require('windshaft/node_modules/redis-mpool/node_modules/redis');
var Windshaft   = require('windshaft');
var healthCheck = require('./healthCheck');
var driver      = require('./driver.js');

var dbUser = process.env.WINDSHAFT_DB_USER;
var dbHost = process.env.DRIVER_DB_HOST;
var dbPort = process.env.DRIVER_DB_PORT;
var dbPassword = process.env.WINDSHAFT_DB_PASSWORD;
var redisHost = process.env.DRIVER_REDIS_HOST;
var redisPort = process.env.DRIVER_REDIS_PORT;
var redisConfig = {
    host: redisHost,
    port: redisPort
};

// Create a connection to the redis client (db #2) for tilekey lookups
console.log('Creating redis client');
var redisClient = Redis.createClient(redisConfig.port, redisConfig.host);
redisClient.select(2);

var config = {
        useProfiler: true,
        // :tablename parameter can be:
        // grout_boundary to get the user-uploaded boundary polygon, or
        // grout_record to get records points.
        // :id parameter can be either ALL to get all boundary polygons/record points, or
        // a UUID of a particular record type or boundary shapefile.
        base_url: '/tiles/table/:tablename/id/:id',
        base_url_notable: '/tiles/table/:tablename',
        req2params: function(req, callback) {
            try {
                driver.setRequestParameters(req, callback, redisClient);
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
            // this must match the Grout SRID set in app/driver/settings.py
            srid: 4326
          }
        }, //see grainstore npm for other options
        renderCache: {
          ttl: 60000 // seconds
        },
        mapnik: {
          metatile: 4,
          bufferSize: 64
        },
        redis: redisConfig,
        enable_cors: true
    };

// Initialize tile server
var ws = new Windshaft.Server(config);
ws.get('/health-check', healthCheck(config));
ws.listen(5000);
console.log("map tiles are now being served out of: http://localhost:5000"
            + config.base_url + '/:z/:x/:y.*');
