/**
 * Windshaft configuration for DRIVER SQL queries and CartoCSS styling.
 */

// RFC4122. See: http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

var baseQuery = ["(SELECT * FROM ashlar_record WHERE schema_id IN ",
                 "(SELECT uuid FROM ashlar_recordschema ",
                 "WHERE next_version_id IS NULL"
                ].join("");

var filterQuery = " AND record_type_id = '";

var endQuery = ")) AS ashlar_record";


// takes the Windshaft req.params and returns new parameters with the query set
function getRequestParameters(params) {

    /* TODO: set
    req.params.style
    req.params.interactivity
    */

    params.dbname = 'driver';

    // return the user-uploaded boundary polygon
    if (params.recordtype === 'GEO') {
        params.table = 'ashlar_boundarypolygon';
        return params;
    }

    // check for a valid record recordtype UUID (or 'ALL' to match all record recordtypes)
    if (params.recordtype !== 'ALL' && !uuidRegex.test(params.recordtype)) {
        console.error('Invalid record recordtype:');
        console.error(params.recordtype);
        throw('Invalid record recordtype UUID');
    }

    params.table = 'ashlar_record';

    // build query for record points
    params.sql = baseQuery;
    if (params.recordtype !== 'ALL') {
        params.sql += filterQuery + params.recordtype + "'";
    }

    params.sql += endQuery;

    return params;
}

exports.getRequestParameters = getRequestParameters;
