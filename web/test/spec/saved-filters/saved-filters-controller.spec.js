'use strict';

describe('driver.savedFilters: SavedFiltersController', function () {

    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.savedFilters'));
    beforeEach(module('pascalprecht.translate'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var Controller;
    var DriverResourcesMock;

    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _DriverResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        DriverResourcesMock = _DriverResourcesMock_;
    }));

    it('should request saved filters', function () {
        $httpBackend.expectGET(/\/api\/userfilters\//)
            .respond(200, DriverResourcesMock.SavedFiltersResponse);

        Controller = $controller('SavedFiltersController', { $scope: $scope });
        $scope.$apply();

        $httpBackend.verifyNoOutstandingRequest();
    });
});
