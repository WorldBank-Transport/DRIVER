'use strict';

describe('driver.state: PolygonState', function () {

    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.state'));

    var $rootScope;
    var $httpBackend;
    var PolygonState;
    var DriverResourcesMock;

    beforeEach(inject(function (_$rootScope_, _$httpBackend_, _PolygonState_, _DriverResourcesMock_) {
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        PolygonState = _PolygonState_;
        DriverResourcesMock = _DriverResourcesMock_;
    }));

    it('should make a request for state options on call to "updateOptions"', function () {
        var polygonUrl = /.*\/api\/boundarypolygons\/\?active=True/;

        PolygonState.updateOptions();
        $httpBackend.expectGET(polygonUrl).respond(200, DriverResourcesMock.PolygonResponse);
    });

});
