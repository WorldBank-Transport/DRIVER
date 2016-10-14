'use strict';

describe('ase.resources: RecordSchemas', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));

    var $httpBackend;
    var RecordSchemas;
    var ResourcesMock;

    beforeEach(inject(function (_$httpBackend_, _RecordSchemas_, _ResourcesMock_) {
        $httpBackend = _$httpBackend_;
        RecordSchemas = _RecordSchemas_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should extract record schemas from paginated response', function () {
        var requestUrl = /\/api\/recordschemas/;
        $httpBackend.whenGET(requestUrl).respond(ResourcesMock.RecordSchemaResponse);
        RecordSchemas.query().$promise.then(function (data) {
            expect(data.length).toBe(1);

            var recordSchema = data[0];
            expect(recordSchema.schema).toEqual(jasmine.any(Object));
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
