'use strict';

describe('driver.resources: Polygons', function () {

    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.resources'));

    var $httpBackend;
    var Polygons;
    var DriverResourcesMock;

    beforeEach(inject(function (_$httpBackend_, _Polygons_, _DriverResourcesMock_) {
        $httpBackend = _$httpBackend_;
        Polygons = _Polygons_;
        DriverResourcesMock = _DriverResourcesMock_;
    }));

    it('should extract polygons from paginated response', function () {
        var requestUrl = /\/api\/boundarypolygons/;
        $httpBackend.whenGET(requestUrl).respond(DriverResourcesMock.PolygonResponse);
        Polygons.query({ active: 'True' }).$promise.then(function (data) {
            expect(data.length).toBe(3);

            var polygon = data[0];
            expect(polygon.properties.data.name).toEqual(jasmine.any(String));
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
