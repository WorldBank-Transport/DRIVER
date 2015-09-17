'use strict';

describe('driver.views.record: ListController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.views.record'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var Controller;
    var DriverResourcesMock;
    var ResourcesMock;

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _DriverResourcesMock_, _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should have header keys', function () {
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;

        var recordSchema = ResourcesMock.RecordSchema;
        var recordSchemaId = recordSchema.uuid;
        var recordSchemaIdUrl = new RegExp('api/recordschemas/' + recordSchemaId);

        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var recordTypeIdUrl = new RegExp('api/recordtypes/' + recordTypeId);

        var recordResponse = DriverResourcesMock.RecordResponse;
        var recordsByTypeUrl = new RegExp('api/records/\\?record_type=' + recordTypeId);

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        $rootScope.$broadcast('driver.filterbar:changed', {});
        Controller = $controller('RecordListController', {
            $scope: $scope,
            $rootScope: $rootScope
        });
        $scope.$apply();

        $httpBackend.flush();
        $rootScope.$broadcast('driver.filterbar:changed', {});
        $httpBackend.expectGET(recordsByTypeUrl).respond(200, recordResponse);
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(Controller.headerKeys.length).toBeGreaterThan(0);
    });

    it('should make offset requests for pagination', function () {
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;

        var recordSchema = ResourcesMock.RecordSchema;
        var recordSchemaId = recordSchema.uuid;
        var recordSchemaIdUrl = new RegExp('api/recordschemas/' + recordSchemaId);

        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var recordTypeIdUrl = new RegExp('api/recordtypes/' + recordTypeId);

        var recordResponse = DriverResourcesMock.RecordResponse;
        var recordsByTypeUrl = new RegExp('api/records/\\?record_type=' + recordTypeId);

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        Controller = $controller('RecordListController', {
            $scope: $scope
        });
        $scope.$apply();
        $httpBackend.flush();

        $rootScope.$broadcast('driver.filterbar:changed', {});
        $httpBackend.expectGET(recordsByTypeUrl).respond(200, recordResponse);
        $httpBackend.flush();

        var recordOffsetResponse = DriverResourcesMock.RecordResponse;
        var recordOffsetUrl = new RegExp('api/records/\\?offset=' + Controller.numRecordsPerPage +
                                         '&record_type=' + recordTypeId);
        $httpBackend.expectGET(recordOffsetUrl).respond(200, DriverResourcesMock.RecordResponse);

        Controller.getNextRecords();
        $httpBackend.flush();

        $httpBackend.expectGET(recordsByTypeUrl).respond(200, recordResponse);

        Controller.getPreviousRecords();
        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingRequest();
    });
});
