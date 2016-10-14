'use strict';

describe('driver.views.duplicates: DuplicatesListController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.views.duplicates'));
    beforeEach(module('pascalprecht.translate'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var Controller;
    var DriverResourcesMock;
    var ResourcesMock;
    var InitialState;

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _DriverResourcesMock_, _ResourcesMock_, _InitialState_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
        InitialState = _InitialState_;

        InitialState.setRecordTypeInitialized();
        InitialState.setBoundaryInitialized();
        InitialState.setGeographyInitialized();
        InitialState.setLanguageInitialized();

        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;

        var recordSchema = ResourcesMock.RecordSchema;
        var recordSchemaId = recordSchema.uuid;
        var recordSchemaIdUrl = new RegExp('api/recordschemas/' + recordSchemaId);

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        Controller = $controller('DuplicatesListController', {
            $scope: $scope,
        });

        var duplicatesOffsetUrl = /api\/duplicates\//;
        $httpBackend.expectGET(duplicatesOffsetUrl).respond(200, DriverResourcesMock.DuplicatesResponse);
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    }));

    it('should have header keys', function () {
        expect(Controller.headerKeys.length).toBeGreaterThan(0);
    });

    it('should make offset requests for pagination', function () {
        var duplicatesOffsetUrl = new RegExp('api/duplicates/\\?.*limit=50.*');
        Controller.getNextDuplicates();
        duplicatesOffsetUrl = duplicatesOffsetUrl = new RegExp('api/duplicates/\\?.*limit=50.*offset=50.*');
        $httpBackend.expectGET(duplicatesOffsetUrl).respond(200, DriverResourcesMock.DuplicatesResponse);
        $httpBackend.flush();

        Controller.getPreviousDuplicates();
        duplicatesOffsetUrl = new RegExp('api/duplicates/\\?.*limit=50.*');
        $httpBackend.expectGET(duplicatesOffsetUrl).respond(200, DriverResourcesMock.DuplicatesResponse);
        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingRequest();
    });
});
