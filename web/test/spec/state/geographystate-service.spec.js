'use strict';

describe('driver.state: Geographies', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.state'));
    beforeEach(module('pascalprecht.translate'));

    var $rootScope;
    var $httpBackend;
    var GeographyState;
    var ResourcesMock;

    beforeEach(inject(function (_$rootScope_, _$httpBackend_, _GeographyState_, _ResourcesMock_) {
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        GeographyState = _GeographyState_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should make a request for state options on call to "updateOptions"', function () {
        var geographiesUrl = /\/api\/boundaries/;

        GeographyState.updateOptions();
        $httpBackend.expectGET(geographiesUrl).respond(200, ResourcesMock.GeographyResponse);
    });

});
