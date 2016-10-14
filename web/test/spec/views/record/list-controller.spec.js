'use strict';

describe('driver.views.record: ListController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.views.record'));
    beforeEach(module('pascalprecht.translate'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var Controller;
    var DriverResourcesMock;
    var InitialState;
    var ResourcesMock;
    var FilterState;

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_, _DriverResourcesMock_,
                                _FilterState_, _InitialState_, _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        DriverResourcesMock = _DriverResourcesMock_;
        FilterState = _FilterState_;
        InitialState = _InitialState_;
        ResourcesMock = _ResourcesMock_;

        FilterState.reset();
        InitialState.setLanguageInitialized();

        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;

        var recordSchema = ResourcesMock.RecordSchema;
        var recordSchemaIdUrl = new RegExp('api/recordschemas/' + recordSchema.uuid);

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
        $httpBackend.verifyNoOutstandingRequest();
    }));

    it('should have header keys', function () {

        $rootScope.$broadcast('driver.filterbar:changed', {});
        var recordOffsetUrl = /api\/records\//;
        $httpBackend.expectGET(recordOffsetUrl).respond(200, DriverResourcesMock.RecordResponse);
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(Controller.headerKeys.length).toBeGreaterThan(0);
    });

    it('should make offset requests for pagination', function () {
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
