'use strict';

describe('driver.audit: AuditDownloadModalController', function () {
    beforeEach(module('driver.audit'));
    beforeEach(module('pascalprecht.translate'));

    var $controller;
    var $rootScope;
    var $scope;
    var $httpBackend;
    var Controller;
    var ModalInstance;
    var FileSaver;

    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_, _FileSaver_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        ModalInstance = {
            close: jasmine.createSpy('ModalInstance.close')
        };
        FileSaver = _FileSaver_;

        spyOn(FileSaver, 'saveAs');

        Controller = $controller('AuditDownloadModalController', {
            $scope: $scope,
            $modalInstance: ModalInstance
        });
        $scope.$apply();
    }));

    it('should initialize the modal controller with the proper defaults', function () {
        expect(Controller.selectedYear).toEqual((new Date()).getFullYear());
        expect(Controller.selectedMonth).toEqual((new Date()).getMonth());
    });

    it('should have a close function', function () {
        Controller.close();
        expect(ModalInstance.close).toHaveBeenCalled();
    });

    it('should call the API and launch a download', function () {
        Controller.selectedYear = 2015;
        // Zero-indexed, so this is September.
        Controller.selectedMonth = 8;
        Controller.onDownloadClicked();
        var dateQuery = '&max_date=2015-09-30T15:59:59.999Z&min_date=2015-08-31T16:00:00.000Z';
        var auditLogUrl = new RegExp('api/audit-log/.format=csv' + dateQuery);
        $httpBackend.expectGET(auditLogUrl).respond(200, 'csv text and stuff');
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
        expect(FileSaver.saveAs).toHaveBeenCalled();
    });

    it('should set an error message if the request comes back empty', function () {
        Controller.onDownloadClicked();
        var auditLogUrl = new RegExp('api/audit-log/.format=csv');
        $httpBackend.expectGET(auditLogUrl).respond(200, '');
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
        expect(FileSaver.saveAs).not.toHaveBeenCalled();
        expect(Controller.error).not.toBe(null);
    });
});
