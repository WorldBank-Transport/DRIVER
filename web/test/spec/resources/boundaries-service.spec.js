'use strict';

describe('driver.resources: Boundaries', function () {

    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.resources'));

    var $httpBackend;
    var Boundaries;
    var DriverResourcesMock;

    beforeEach(inject(function (_$httpBackend_, _Boundaries_, _DriverResourcesMock_) {
        $httpBackend = _$httpBackend_;
        Boundaries = _Boundaries_;
        DriverResourcesMock = _DriverResourcesMock_;
    }));

    it('should extract boundaries from paginated response', function () {
        var requestUrl = /\/api\/boundaries/;
        $httpBackend.whenGET(requestUrl).respond(DriverResourcesMock.BoundaryResponse);
        Boundaries.query({ active: 'True' }).$promise.then(function (data) {
            expect(data.length).toBe(1);

            var boundary = data[0];
            expect(boundary.label).toEqual('admin zero');
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
