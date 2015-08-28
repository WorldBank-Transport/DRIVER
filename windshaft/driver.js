/**
 * Windshaft configuration for DRIVER SQL queries and CartoCSS styling.
 */

// RFC4122. See: http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


// NB: interactivity only works with string columns
var baseRecordQuery = ["(SELECT geom, uuid::varchar, data::varchar, occurred_from::varchar, ",
                       "occurred_to::varchar, label, slug ",
                       "FROM ashlar_record WHERE schema_id IN ",
                       "(SELECT uuid FROM ashlar_recordschema ",
                       "WHERE next_version_id IS NULL"
                       ].join("");
var filterRecordQuery = " AND record_type_id = '";
var endRecordQuery = ")) AS ashlar_record";


// SELECT p.uuid AS polygon_id, b.uuid AS shapefile_id, b.label, b.color
// FROM ashlar_boundarypolygon p INNER JOIN ashlar_boundary b ON (p.boundary_id=b.uuid);

var baseBoundaryQuery = ["(SELECT p.uuid AS polygon_id, b.uuid AS shapefile_id, ",
                         "b.label, b.color, p.geom ",
                         "FROM ashlar_boundarypolygon p INNER JOIN ashlar_boundary b ",
                         "ON (p.boundary_id=b.uuid)"
                        ].join("");
var filterBoundaryQuery = " WHERE b.uuid ='"
var endBoundaryQuery = ") AS ashlar_boundary";


// takes the Windshaft req.params and returns new parameters with the query set
function getRequestParameters(params) {

    // TODO: set params.style

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

        // for UTFGrid interactivity; must be string columns
        params.interactivity = 'uuid,occurred_from,label,slug,data';

        // build query for record points
        params.sql = baseRecordQuery;
        if (params.id !== 'ALL') {
            params.sql += filterRecordQuery + params.id + "'";
        }

        params.sql += endRecordQuery;
    } else {

        // for UTFGrid
        params.interactivity = 'label';

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