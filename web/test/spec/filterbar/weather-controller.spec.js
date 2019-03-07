'use strict';

describe('driver.filterbar: WeatherController', function () {

    beforeEach(module('driver.weather'));
    beforeEach(module('driver.filterbar'));

    var $controller;
    var $rootScope;
    var $scope;
    var Controller;

    beforeEach(inject(function (_$controller_, _$rootScope_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        Controller = $controller('weatherController', {
            $scope: $scope
        });
        $scope.$apply();
    }));

    it('should initially have an empty selection', function () {
        expect(Controller.selection).toBeFalsy();
    });
});
