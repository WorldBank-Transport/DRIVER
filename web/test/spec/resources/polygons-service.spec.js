'use strict';

describe('driver.resources: Polygons', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.resources'));

    var $httpBackend;
    var Polygons;
    var ResourcesMock;

    beforeEach(inject(function (_$httpBackend_, _Polygons_, _ResourcesMock_) {
        $httpBackend = _$httpBackend_;
        Polygons = _Polygons_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should extract polygons from paginated response', function () {
        var requestUrl = /\/api\/boundarypolygons/;
        $httpBackend.whenGET(requestUrl).respond(200, ResourcesMock.BoundaryNoGeomResponse);
        Polygons.query({ active: 'True' }).$promise.then(function (data) {
            expect(data.length).toBe(1);

            var polygon = data[0];
            expect(polygon.data.REGION).toEqual(jasmine.any(String));
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
