'use strict';

describe('driver.views.record: RecordList', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.views.record'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var localStorageService;
    var recordState;
    var DriverResourcesMock;
    var InitialState;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_, _localStorageService_,
                                _RecordState_, _DriverResourcesMock_, _InitialState_,
                                _ResourcesMock_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        localStorageService = _localStorageService_;
        recordState = _RecordState_;
        DriverResourcesMock = _DriverResourcesMock_;
        InitialState = _InitialState_;
        ResourcesMock = _ResourcesMock_;

        InitialState.setLanguageInitialized();

        spyOn(localStorageService, 'get');
    }));

    it('should load directive', function () {
        var recordsUrl = /\/api\/records/;
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        var recordSchemaUrl = /\/api\/recordschemas/;

        var boundariesUrl = /api\/boundaries/;
        var boundaryPolygonsUrl = /api\/boundarypolygons\//;

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(boundariesUrl).respond(200, ResourcesMock.GeographyResponse);
        $httpBackend.expectGET(boundaryPolygonsUrl).respond(200, ResourcesMock.BoundaryNoGeomResponse);
        $httpBackend.expectGET(recordSchemaUrl).respond(200, ResourcesMock.RecordSchema);

        var scope = $rootScope.$new();
        var element = $compile('<driver-record-list></driver-record-list>')(scope);
        $rootScope.$apply();

        $httpBackend.flush();

        $rootScope.$broadcast('driver.filterbar:changed', {});
        $httpBackend.expectGET(recordsUrl).respond(200, DriverResourcesMock.RecordResponse);
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(element.find('.date').length).toBeGreaterThan(0);
        expect(element.find('.detail').length).toBeGreaterThan(0);
        expect(element.find('.links').length).toBeGreaterThan(0);
    });
});
