'use strict';

describe('ase.resources: RecordTypes', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));

    var $httpBackend;
    var RecordTypes;
    var ResourcesMock;

    beforeEach(inject(function (_$httpBackend_, _RecordTypes_, _ResourcesMock_) {
        $httpBackend = _$httpBackend_;
        RecordTypes = _RecordTypes_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should extract record types from paginated response', function () {
        var requestUrl = /\/api\/recordtypes/;
        $httpBackend.whenGET(requestUrl).respond(ResourcesMock.RecordTypeResponse);
        RecordTypes.query({ active: 'True' }).$promise.then(function (data) {
            expect(data.length).toBe(3);

            var recordType = data[0];
            expect(recordType.label).toEqual(jasmine.any(String));
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
