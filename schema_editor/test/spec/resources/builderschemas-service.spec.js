'use strict';

describe('ase.resources: BuilderSchemas', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('ase.schemas'));

    var $httpBackend;
    var BuilderSchemas;
    var ResourcesMock;
    var Schemas;
    var schemaEnv = jjv();
    schemaEnv.addSchema('v4', jsonSchemaV4());

    beforeEach(inject(function (_$httpBackend_, _BuilderSchemas_, _ResourcesMock_, _Schemas_) {
        $httpBackend = _$httpBackend_;
        BuilderSchemas = _BuilderSchemas_;
        ResourcesMock = _ResourcesMock_;
        Schemas = _Schemas_;
    }));

    it('should load valid related schema', function () {
        var relatedBuilderSchema = readJSON('app/builder-schemas/related.json');
        var requestUrl = /builder-schemas\/related\.json/;
        $httpBackend.whenGET(requestUrl).respond(relatedBuilderSchema);

        BuilderSchemas.get({ name: 'related' }).$promise.then(function (schema) {
            expect(schemaEnv.validate('v4', schema)).toBe(null);
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
