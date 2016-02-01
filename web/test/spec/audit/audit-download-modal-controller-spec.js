'use strict';

describe('driver.audit: AuditDownloadModalController', function () {
    beforeEach(module('driver.audit'));

    var $controller;
    var $rootScope;
    var $scope;
    var Controller;
    var ModalInstance;

    beforeEach(inject(function (_$controller_, _$rootScope_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        ModalInstance = {
            close: jasmine.createSpy('ModalInstance.close')
        };

        Controller = $controller('AuditDownloadModalController', {
            $scope: $scope,
            $modalInstance: ModalInstance
        });
    }));

    it('should initialize the modal controller with the proper defaults', function () {
        $scope.$apply();

        expect(Controller.selectedYear).toEqual((new Date()).getFullYear());
        expect(Controller.selectedMonth).toEqual((new Date()).getMonth().toString());
    });

    it('should have a close function', function () {
        $scope.$apply();

        Controller.close();
        expect(ModalInstance.close).toHaveBeenCalled();
    });

    it('should update its query string when dates change', function () {
        $scope.$apply();

        // Zero-indexed, so this is September.
        Controller.onDateChange(2015, '8');
        expect(Controller.dateQueryStr)
          .toEqual('min_date=2015-08-31T16:00:00.000Z&max_date=2015-09-30T15:59:59.999Z');
        Controller.onDateChange(2012, '1');
        expect(Controller.dateQueryStr)
          .toEqual('min_date=2012-01-31T16:00:00.000Z&max_date=2012-02-29T15:59:59.999Z');
    });
});
