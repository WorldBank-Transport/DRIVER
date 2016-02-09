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
    var FilterState;

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _DriverResourcesMock_, _ResourcesMock_, _FilterState_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
        FilterState = _FilterState_;
        FilterState.reset();
    }));

    it('should have header keys', function () {
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;

        var recordSchema = ResourcesMock.RecordSchema;
        var recordSchemaId = recordSchema.uuid;
        var recordSchemaIdUrl = new RegExp('api/recordschemas/' + recordSchemaId);

        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;

        var boundariesUrl = /api\/boundaries/;
        var boundaryPolygonsUrl = /api\/boundarypolygons/;

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(boundariesUrl).respond(200, ResourcesMock.GeographyResponse);
        $httpBackend.expectGET(boundaryPolygonsUrl).respond(200, ResourcesMock.BoundaryNoGeomResponse);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        $rootScope.$broadcast('driver.filterbar:changed', {});
        Controller = $controller('RecordListController', {
            $scope: $scope,
            $rootScope: $rootScope
        });
        $scope.$apply();

        $httpBackend.flush();
        $rootScope.$broadcast('driver.filterbar:changed', {});
        var recordOffsetUrl = /api\/records\//;
        $httpBackend.expectGET(recordOffsetUrl).respond(200, DriverResourcesMock.RecordResponse);
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

        var boundariesUrl = /api\/boundaries/;
        var boundaryPolygonsUrl = /api\/boundarypolygons/;

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(boundariesUrl).respond(200, ResourcesMock.GeographyResponse);
        $httpBackend.expectGET(boundaryPolygonsUrl).respond(200, ResourcesMock.BoundaryNoGeomResponse);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        Controller = $controller('RecordListController', {
            $scope: $scope
        });
        $scope.$apply();
        $httpBackend.flush();

        $rootScope.$broadcast('driver.filterbar:changed', {});
        var recordOffsetUrl = new RegExp('api/records/\\?.*limit=50.*');
        $httpBackend.expectGET(recordOffsetUrl).respond(200, DriverResourcesMock.RecordResponse);
        $httpBackend.flush();

        Controller.getNextRecords();
        recordOffsetUrl = recordOffsetUrl = new RegExp('api/records/\\?.*limit=50.*offset=50.*');
        $httpBackend.expectGET(recordOffsetUrl).respond(200, DriverResourcesMock.RecordResponse);
        $httpBackend.flush();

        Controller.getPreviousRecords();
        recordOffsetUrl = new RegExp('api/records/\\?.*limit=50.*');
        $httpBackend.expectGET(recordOffsetUrl).respond(200, DriverResourcesMock.RecordResponse);
        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingRequest();
    });
});
