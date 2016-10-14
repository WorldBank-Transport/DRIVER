'use strict';

describe('driver.filterbar: NumericRangeController', function () {

    beforeEach(module('driver.filterbar'));

    var $controller;
    var $rootScope;
    var $scope;
    var Controller;

    beforeEach(inject(function (_$controller_, _$rootScope_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        Controller = $controller('numericRangeController', {
            $scope: $scope
        });
        $scope.$apply();
    }));

    it('should return true if min is less than max and set classes to be non-dangerous', function () {
        var validity = Controller.isMinMaxValid(0, 1);
        expect(validity).toBe(true);
        expect(_.isEqual(Controller.error, {'classes': '', 'btnClasses': ''})).toBe(true);
    });

    it('should return false if min is less than max and set classes to "danger"', function () {
        var validity = Controller.isMinMaxValid(1, 0);
        expect(validity).toBe(false);
        expect(_.isEqual(Controller.error, {'classes': 'alert-danger', 'btnClasses': ''})).toBe(true);
    });

    it('should return true if min is equal to max and set classes to be non-dangerous', function () {
        var validity = Controller.isMinMaxValid(0, 0);
        expect(validity).toBe(true);
        expect(_.isEqual(Controller.error, {'classes': '', 'btnClasses': ''})).toBe(true);
    });
});
