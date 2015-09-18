/**
 * Windshaft configuration for DRIVER SQL queries and CartoCSS styling.
 */

// RFC4122. See: http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// queries

// NB: interactivity only works with string columns
var baseRecordQuery = ["(SELECT geom, uuid::varchar, data::varchar, occurred_from::varchar, ",
                       "occurred_to::varchar ",
                       "FROM ashlar_record WHERE schema_id IN ",
                       "(SELECT uuid FROM ashlar_recordschema "
                       ].join("");
var filterRecordQuery = " WHERE record_type_id = '";
var endRecordQuery = ")) AS ashlar_record";

var baseBoundaryQuery = ["(SELECT p.uuid AS polygon_id, b.uuid AS shapefile_id, ",
                         "b.label, b.color, p.geom ",
                         "FROM ashlar_boundarypolygon p INNER JOIN ashlar_boundary b ",
                         "ON (p.boundary_id=b.uuid)"
                        ].join("");
var filterBoundaryQuery = " WHERE b.uuid ='"
var endBoundaryQuery = ") AS ashlar_boundary";

// styling

var heatmapStyle = [
    '#ashlar_record {',
    'image-filters: colorize-alpha(blue, cyan, lightgreen, yellow , orange, red);',
    'comp-op:darken;',
    'marker-allow-overlap: true;',
    'marker-file: url(alphamarker.png);',
    'marker-fill-opacity: 0.2;',
    'marker-width: 10;',
    '[zoom < 7] { marker-width: 5; }',
    '[zoom > 9] { marker-width: 15; }',
'}'].join('');

var eventsStyle = [
    '#ashlar_record {',
    'marker-fill-opacity: 0.5;',
    'marker-fill: #0040ff;',
    'marker-line-color: #FFF;',
    'marker-line-width: 0;',
    'marker-line-opacity: 1;',
    'marker-placement: point;',
    'marker-type: ellipse;',
    'marker-width: 4;',
    'marker-allow-overlap: true;',
'}'].join('');

var boundaryStyle = [
    '#ashlar_boundary {',
    'line-width: 2;',
    'line-color: #04b431;',
    'polygon-opacity: 0;',
    'line-opacity: 0.7',
'}'].join('');


// takes the Windshaft request and returns new parameters with the query set
function getRequestParameters(request) {

    var params = request.params;

    params.dbname = 'driver';

    if (params.tablename !== 'ashlar_boundary' && params.tablename !== 'ashlar_record') {
        // table name must be for record or boundary polygon
        throw('Invalid table name');
    }

    // check for a valid record type UUID (or 'ALL' to match all record types)
    if (params.id !== 'ALL' && !uuidRegex.test(params.id)) {
        console.error('Invalid UUID:');
        console.error(params.id);
        throw('Invalid record type UUID');
    }

    params.table = params.tablename;

    if (params.tablename === 'ashlar_record') {

        params.interactivity = 'uuid,occurred_from,data';
        params.style = eventsStyle;

        // build query for record points if do not already have a query
        if (request.query.sql) {
            params.sql = request.query.sql;
        } else {
            params.sql = baseRecordQuery;
            if (params.id !== 'ALL') {
                params.sql += filterRecordQuery + params.id + "'" + endRecordQuery;
            }
        }

        if (request.query.heatmap) {
            // make a heatmap if optional parameter for that was sent in
            params.style = heatmapStyle;
        }
    } else {
        params.interactivity = 'label';
        params.style = boundaryStyle;

        // TODO: use color column for styling?
        // how to set polygon-fill so that differs per column?
        // does not seem to be allowed by CartoCSS

        // build query for bounding polygon
        if (params.id === 'ALL') {
            params.sql = baseBoundaryQuery + endBoundaryQuery;
        } else {
            // filter for a specific bounding polygon UUID
            params.sql = baseBoundaryQuery + filterBoundaryQuery + params.id + "'" + endBoundaryQuery;
        }
    }

    return params;
}

exports.getRequestParameters = getRequestParameters;
