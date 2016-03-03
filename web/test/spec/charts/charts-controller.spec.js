'use strict';

describe('driver.tools.charts: ChartsController', function () {

    beforeEach(module('driver.tools.charts'));

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
        Controller = $controller('ChartsController', { $scope: $scope });
        $scope.$apply();
    });
});
