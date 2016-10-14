'use strict';

describe('driver.state: BoundaryState', function () {

    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.state'));
    beforeEach(module('pascalprecht.translate'));

    var $rootScope;
    var $httpBackend;
    var BoundaryState;
    var DriverResourcesMock;

    beforeEach(inject(function (_$rootScope_, _$httpBackend_, _BoundaryState_, _DriverResourcesMock_) {
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        BoundaryState = _BoundaryState_;
        DriverResourcesMock = _DriverResourcesMock_;
    }));

    it('should make a request for state options on call to "updateOptions"', function () {
        var boundaryUrl = /.*\/api\/boundaries\/\?active=True/;

        BoundaryState.updateOptions();
        $httpBackend.expectGET(boundaryUrl).respond(200, DriverResourcesMock.BoundaryResponse);
    });

});
