'use strict';

describe('driver.resources: Records', function () {

    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.resources'));

    var $httpBackend;
    var Records;
    var DriverResourcesMock;

    beforeEach(inject(function (_$httpBackend_, _Records_, _DriverResourcesMock_) {
        $httpBackend = _$httpBackend_;
        Records = _Records_;
        DriverResourcesMock = _DriverResourcesMock_;
    }));

    it('should extract records from paginated response', function () {
        var requestUrl = /\/api\/records/;
        $httpBackend.whenGET(requestUrl).respond(DriverResourcesMock.RecordResponse);
        Records.query({ active: 'True' }).$promise.then(function (data) {
            expect(data.length).toBe(3);

            var record = data[0];
            expect(record.schema).toEqual(jasmine.any(String));
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
