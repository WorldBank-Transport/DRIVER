var Windshaft = require('windshaft');
var healthCheck = require('./healthCheck');


var config = {
        useProfiler: true,
        base_url: '/database/:dbname/table/:table',
        base_url_notable: '/database/:dbname',
        req2params: function(req, callback){
          callback(null,req)
        },
        grainstore: {
          datasource: {
            user:'driver',
            password: 'driver',
            host: '192.168.11.101',
            port: 5432,
            geometry_field: 'the_geom',
            srid: 4326
          }
        }, //see grainstore npm for other options
        renderCache: {
          ttl: 60000, // seconds
        },
        mapnik: {
          metatile: 4,
          bufferSize:64
        },
        redis: {
            host: '127.0.0.1',
            port: 6379
        }
        ,req2params: function(req, callback) {
        try {
            /* CAN SET HERE THINGS LIKE:
            req.params.table
            req.params.dbname
            req.params.style
            req.params.interactivity
            */
            callback(null, req);
        } catch(err) {
            callback(err, null);
        }
    }
    };

// Initialize tile server
var ws = new Windshaft.Server(config);
ws.get('/health-check', healthCheck(config));
ws.listen(5000);
console.log("map tiles are now being served out of: http://localhost:5000"
            + config.base_url + '/:z/:x/:y.*');