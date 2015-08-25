var Windshaft = require('windshaft');
var healthCheck = require('./healthCheck');

var dbUser = process.env.DRIVER_DB_USER;
var dbHost = process.env.DRIVER_DB_HOST;
var dbPort = process.env.DRIVER_DB_PORT;
var dbPassword = process.env.DRIVER_DB_PASSWORD;
var redisHost = process.env.DRIVER_REDIS_HOST;
var redisPort = process.env.DRIVER_REDIS_PORT;

// RFC4122. See: http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

var baseQuery = ["(SELECT * FROM ashlar_record WHERE schema_id = ",
                 "(SELECT uuid FROM ashlar_recordschema ",
                 "WHERE next_version_id IS NULL"
                ].join("");
var filterQuery =  " AND record_type_id = '";
var endQuery = ")) AS ashlar_record";

var config = {
        useProfiler: true,
        base_url: '/tiles/recordtype/:recordtype',
        base_url_notable: '/tiles/recordtype/:recordtype',
        req2params: function(req, callback) {
            try {
                // check for a valid record type UUID (or 'ALL' to match all types)
                 if (req.params.recordtype !== 'ALL' && !uuidRegex.test(req.params.recordtype)) {
                    console.error('Invalid record type:');
                    console.error(req.params.recordtype);
                    throw('Invalid recordtype UUID');
                 }

                req.params.dbname = 'driver';
                req.params.table = 'ashlar_record';

                req.params.sql = baseQuery;

                if (req.params.recordtype !== 'ALL') {
                    req.params.sql = baseQuery + filterQuery + req.params.recordtype + "'";
                }

                req.params.sql += endQuery;

                /* TODO: set
                req.params.style
                req.params.interactivity
                */

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