'use strict';

describe('ase.schemas:Schemas', function () {

    beforeEach(module('ase.schemas'));

    var Schemas;
    var schemaEnv = jjv();
    schemaEnv.addSchema('v4', jsonSchemaV4());

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_Schemas_) {
        Schemas = _Schemas_;
    }));

    it('should ensure JsonObject is a valid jsonschema v4', function () {
        var obj = Schemas.JsonObject();
        expect(schemaEnv.validate('v4', obj)).toBe(null);
    });
});