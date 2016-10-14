'use strict';

describe('driver.filterbar: DateRangeController', function () {

    beforeEach(module('driver.filterbar'));

    var $controller;
    var $rootScope;
    var $scope;
    var Controller;

    beforeEach(inject(function (_$controller_, _$rootScope_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        Controller = $controller('dateRangeController', {
            $scope: $scope
        });
        $scope.$apply();
    }));

    it('should return true if minless than max', function () {
        var oldDate = new Date(1); // 1969
        var validity = Controller.isMinMaxValid({'min': oldDate, 'max': new Date()});
        expect(validity).toBe(true);
    });

    it('should return false if min is less than max and set classes to "danger"', function () {
        var oldDate = new Date(1); // 1969
        var validity = Controller.isMinMaxValid({'min': new Date(), 'max': oldDate});
        expect(validity).toBe(false);
    });

    it('should return true if min is equal to max and set classes to be non-dangerous', function () {
        var date = new Date();
        var validity = Controller.isMinMaxValid({'min': date, 'max': date});
        expect(validity).toBe(true);
    });
});
