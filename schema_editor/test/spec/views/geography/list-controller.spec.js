'use strict';

describe('ase.views.geography: ListController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.views.geography'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var Controller;
    var ResourcesMock;

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        ResourcesMock = _ResourcesMock_;
    }));

    it('should make an httprequest for active geographies on controller initialize', function () {
        var requestUrl = /\/api\/boundaries/;
        $httpBackend.expectGET(requestUrl).respond(200, ResourcesMock.GeographyResponse);

        Controller = $controller('GeoListController', {
            $scope: $scope
        });
        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
