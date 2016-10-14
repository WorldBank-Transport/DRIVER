'use strict';

describe('driver.tools.export: ExportController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.tools.export'));
    beforeEach(module('pascalprecht.translate'));

    var $controller;
    var $httpBackend;
    var $scope;
    var $interval;
    var $rootScope;
    var Controller;
    var DriverResourcesMock;
    var ResourcesMock;
    var InitialState;

    var ExportsMock = {
        tilekeyResponse: { 'tilekey': 'valid-tilekey' },
        taskID: 'this_is_a_task_id',
        taskResponse: { 'taskid': 'this_is_a_task_id', 'success': true },
        taskErrorResponse: { 'errors': {} },
        startedResponse: { 'status': "STARTED", 'info': {} },
        successResponse: { 'status': "SUCCESS", 'result': "http://localhost:7000/download/this_is_a_task_id" },
        failureResponse: { 'status': 'FAILURE', 'error': 'The export job went kablooey.' },
    };

    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_, _$interval_,
                                _DriverResourcesMock_, _ResourcesMock_, _InitialState_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $interval = _$interval_;
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
        InitialState = _InitialState_;

        InitialState.setRecordTypeInitialized();
        InitialState.setBoundaryInitialized();
        InitialState.setGeographyInitialized();
        InitialState.setLanguageInitialized();

        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        var boundariesUrl = /api\/boundaries/;
        var boundaryPolygonsUrl = /api\/boundarypolygons/;
        var recordSchemaUrl = /\/api\/recordschemas\/\?limit=all/;

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(boundariesUrl).respond(200, ResourcesMock.GeographyResponse);
        $httpBackend.expectGET(recordSchemaUrl).respond(200, ResourcesMock.RecordSchemaResponse);
        $httpBackend.expectGET(boundaryPolygonsUrl).respond(200, ResourcesMock.BoundaryNoGeomResponse);

        $scope.recordQueryParams = {};
        Controller = $controller('ExportController', { $scope: $scope });
        $scope.$apply();
    }));

    it('should set an error message if the task creation call fails', function () {
        expect(Controller.error).toBe(null);
        var recordUrl = /\/api\/records\/\?.*tilekey=true/;
        $httpBackend.expectGET(recordUrl).respond(200, ExportsMock.tilekeyResponse);
        var startExportURL = new RegExp('/api/csv-export/');
        $httpBackend.expectPOST(startExportURL).respond(400, ExportsMock.taskErrorResponse);
        Controller.exportCSV();
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
        $scope.$apply();

        expect(Controller.error).not.toBe(null);
        expect(Controller.pending).toBe(false);
    });

    describe('driver.tools.export: ExportController.exportCSV', function () {
        var statusURL;

        beforeEach(function () {
            var recordUrl = /\/api\/records\/\?.*tilekey=true/;
            $httpBackend.expectGET(recordUrl).respond(ExportsMock.tilekeyResponse);

            var startExportURL = new RegExp('/api/csv-export/');
            $httpBackend.expectPOST(startExportURL).respond(201, ExportsMock.taskResponse);

            Controller.exportCSV();

            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingRequest();
            $scope.$apply();

            statusURL = new RegExp('/api/csv-export/' + ExportsMock.taskResponse.taskid + '/');

            spyOn($interval, 'cancel').and.callThrough();
        });

        it('should call task creation API and start polling for status on success', function () {
            // This tests the initial step. The actual work is done in the beforeEach.
            expect(Controller.error).toBe(null);
            expect(Controller.pending).toBe(true);
        });

        it('should poll for export status and save the download link on success', function () {
            $httpBackend.expectGET(statusURL).respond(200, ExportsMock.startedResponse);
            $interval.flush(1600);
            $httpBackend.expectGET(statusURL).respond(200, ExportsMock.startedResponse);
            $interval.flush(1500);
            $httpBackend.expectGET(statusURL).respond(200, ExportsMock.successResponse);
            $interval.flush(1500);
            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingRequest();

            expect($interval.cancel).toHaveBeenCalled();
            expect(Controller.pending).toBe(false);
            expect(Controller.downloadURL).toEqual(ExportsMock.successResponse.result);
        });

        it('should set an error message on failed export status', function () {
            $httpBackend.expectGET(statusURL).respond(200, ExportsMock.failureResponse);
            $interval.flush(1600);
            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingRequest();

            expect($interval.cancel).toHaveBeenCalled();
            expect(Controller.pending).toBe(false);
            expect(Controller.error).not.toBe(null);
            expect(Controller.downloadURL).toBe(null);
        });

        it('should cancel polling and set an error when it times out', function () {
            $httpBackend.whenGET(statusURL).respond(200, ExportsMock.startedResponse);
            $interval.flush(1000000);
            expect($interval.cancel).toHaveBeenCalled();
            expect(Controller.pending).toBe(false);
            expect(Controller.error).not.toBe(null);
            expect(Controller.downloadURL).toBe(null);
        });

    });

});
