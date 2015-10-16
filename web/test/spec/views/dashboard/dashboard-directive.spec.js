'use strict';

describe('driver.views.dashboard: Dashboard', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.views.dashboard'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var RecordTypes;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_,
                                _RecordTypes_, _ResourcesMock_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        RecordTypes = _RecordTypes_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should load directive', function () {
        var scope = $rootScope.$new();
        var element = $compile('<driver-dashboard></driver-dashboard>')(scope);

        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        var boundaryPolygonsUrl = /api\/boundarypolygons/;

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.whenGET(boundaryPolygonsUrl).respond(200, ResourcesMock.BoundaryNoGeomResponse);

        $rootScope.$apply();

        // placeholder test
        expect(element.find('driver-toddow').length).toEqual(1);
    });
});
