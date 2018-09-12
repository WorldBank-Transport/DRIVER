/**
 * Windshaft configuration for DRIVER SQL queries and CartoCSS styling.
 */

var _ = require('windshaft/node_modules/underscore');

// RFC4122. See: http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

var validTables = ['grout_boundary', 'grout_record', 'black_spots_blackspot'];

// queries
var baseBoundaryQuery = ["(SELECT p.uuid AS polygon_id, b.uuid AS shapefile_id, ",
                         "b.label, b.color, p.geom ",
                         "FROM grout_boundarypolygon p INNER JOIN grout_boundary b ",
                         "ON (p.boundary_id=b.uuid)"
                        ].join("");
var filterBoundaryQuery = " WHERE b.uuid ='";
var endBoundaryQuery = ") AS grout_boundary";

var baseBlackspotQuery = ["(SELECT * ",
                          "FROM black_spots_blackspot b "].join("");
var filterBlackspotQuery = "WHERE b.black_spot_set_id ='";
var endBlackspotQuery = ") AS black_spots_blackspot";

// styling

var heatmapRules = [
    'image-filters: colorize-alpha(blue, cyan, lightgreen, yellow , orange, red);',
    'comp-op:darken;',
    'marker-allow-overlap: true;',
    'marker-file: url(alphamarker.png);',
    'marker-fill-opacity: 0.2;',
    'marker-width: 10;',
    '[zoom < 7] { marker-width: 5; }',
    '[zoom > 9] { marker-width: 15; }',
];
var heatmapStyle = constructCartoStyle('#grout_record', heatmapRules);

var eventsRules = [
    'marker-fill-opacity: 0.5;',
    'marker-fill: #0040ff;',
    'marker-line-color: #FFF;',
    'marker-line-width: 0;',
    'marker-line-opacity: 1;',
    'marker-placement: point;',
    'marker-type: ellipse;',
    'marker-width: 4;',
    'marker-allow-overlap: true;',
];
var eventsStyle = constructCartoStyle('#grout_record', eventsRules);

var secondaryRules = [
    'marker-fill-opacity: 0.5;',
    'marker-fill: #00ee40;',
    'marker-line-color: #FFF;',
    'marker-line-width: 0;',
    'marker-line-opacity: 1;',
    'marker-placement: point;',
    'marker-type: ellipse;',
    'marker-width: 4;',
    'marker-allow-overlap: true;',
];
var secondaryStyle = constructCartoStyle('#grout_record', secondaryRules);

var boundaryRules = [
    'line-width: 2;',
    'polygon-opacity: 0;',
    'line-opacity: 0.7;', // line-color will be set on a per-request basis
];

var blackspotRules = [
    'line-width: 2;',
    'polygon-opacity: 0.5;',
    'line-opacity: 0.8;',
    'line-color: red;',
    'polygon-fill: red;'
];
var blackspotStyle = constructCartoStyle('#black_spots_blackspot', blackspotRules);

/** Construct a CartoCSS style string that applies to class, containing rules
 * @param {String} layer The #-prefixed layer name
 * @param {Array} rules The styling rules to apply to this layer
 */
function constructCartoStyle(layer, rules) {
    return layer + ' {' + rules.join('') + '}';
}

// takes the Windshaft request, sets the filter params, and calls the callback
function setRequestParameters(request, callback, redisClient) {

    var params = request.params;
    var tilekey = request.query.tilekey;

    params.dbname = 'driver';

    // table name must be in the whitelist
    if (!_.contains(validTables, params.tablename)) {
        throw('Invalid table name ' + params.tablename);
    }

    // check for a valid record type UUID (or 'ALL' to match all record types)
    if (params.id !== 'ALL' && !uuidRegex.test(params.id)) {
        console.error('Invalid UUID:');
        console.error(params.id);
        throw('Invalid record type UUID');
    }

    params.table = params.tablename;

    if (params.tablename === 'grout_record') {

        params.interactivity = 'uuid,occurred_from';
        params.style = eventsStyle;

        if (request.query.heatmap) {
            // make a heatmap if optional parameter for that was sent in
            params.style = heatmapStyle;
        } else if (request.query.secondary) {
            params.style = secondaryStyle;
        }

        // retrieve stored query for record points
        if (!tilekey) {
            throw('Parameter: `tilekey` must be specified');
        } else {
            redisClient.get(tilekey, function(err, sql) {
                if (!sql) {
                    callback('Error getting tilekey', null);
                    return;
                }

                // cast string columns for interactivity
                var fromIdx = sql.indexOf(' FROM');
                var select = sql.substr(0, fromIdx);
                var theRest = sql.substr(fromIdx);
                var fields = select.split(', ');
                var geomRegex = /geom/;
                var castSelect = _.map(fields, function(field) {
                    if (field.match(geomRegex)) {
                        return field; // do not cast geom field
                    } else {
                        return field + '::varchar';
                    }
                }).join(', ');

                params.sql = '(' + castSelect + theRest + ') as grout_record' ;
                callback(null, request);
            });
        }
    } else if (params.tablename === 'grout_boundary'){
        params.interactivity = 'label';
        var boundaryColor = request.query.color || '#f4b431';
        var colorStyle = 'line-color: ' + boundaryColor + ';';
        params.style = constructCartoStyle('#grout_boundary', boundaryRules.concat([colorStyle]));

        // build query for bounding polygon
        // filter for a specific bounding polygon UUID
        params.sql = baseBoundaryQuery + filterBoundaryQuery +
            params.id + "'" + endBoundaryQuery;

        callback(null, request);
    } else if (params.tablename === 'black_spots_blackspot') {
        if (tilekey) {
            params.interactivity = 'uuid,severity_score,num_records,num_severe';
            params.style = blackspotStyle;
            redisClient.get(params.id, function(err, sql) {
                if (!sql) {
                    callback('Error getting tilekey', null);
                    return;
                }

                var fromIdx = sql.indexOf(' FROM');
                var select = sql.substr(0, fromIdx);
                var theRest = sql.substr(fromIdx);
                var fields = select.split(', ');
                var geomRegex = /geom/;
                var severityRegex = /severity_score/;
                var castSelect = _.map(fields, function(field) {
                    if (field.match(geomRegex) || field.match(severityRegex)) {
                        return field; // do not cast geom field
                    } else {
                        return field + '::varchar';
                    }
                }).join(', ');

                params.sql = '(' + castSelect + theRest + ') as black_spots_blackspot' ;
                callback(null, request);
            });
        } else {
            //record type, filter effective at
            params.interactivity = 'uuid,severity_score,num_records,num_severe';
            params.style = blackspotStyle;
            if (params.id === 'ALL') {
                params.sql = baseBoundaryQuery + endBlackspotQuery;
            } else {
                params.sql = baseBlackspotQuery + filterBlackspotQuery +
                    params.id + "'" + endBlackspotQuery;
            }
            callback(null, request);
        }
    }
}

exports.setRequestParameters = setRequestParameters;
