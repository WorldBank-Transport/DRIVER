'use strict';

describe('ase.schemas:Schemas', function () {

    beforeEach(module('ase.schemas'));

    var Schemas;

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_Schemas_) {
        Schemas = _Schemas_;
    }));

    describe('it should ensure JsonObject is a valid jsonschema', function () {
        var obj = Schemas.JsonObject();
        expect(obj.type).toEqual('object');
    });
});