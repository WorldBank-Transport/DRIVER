'use strict';

describe('driver.recentProportions: RecentProportionsController', function () {

    beforeEach(module('driver.recentProportions'));

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
        Controller = $controller('RecentProportionsController', { $scope: $scope });
        $scope.$apply();
    });
});
