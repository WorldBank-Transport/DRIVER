'use strict';

describe('driver.details: BlackSpotsController', function () {

    beforeEach(module('driver.blackSpots'));

    var $controller;
    var $rootScope;
    var $scope;
    var Controller;

    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
    }));

    it('should pass this placeholder test', function () {
        Controller = $controller('BlackSpotsController', { $scope: $scope });
        $scope.$apply();
    });
});
