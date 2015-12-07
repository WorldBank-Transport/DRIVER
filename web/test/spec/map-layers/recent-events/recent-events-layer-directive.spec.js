'use strict';

describe('driver.map-layers.recent-events: Recent Events Layer Directive', function () {
    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.map-layers.recent-events'));
    beforeEach(module('driver.mock.resources'));

    var $compile;
    var $rootScope;
    var $httpBackend;
    var DriverResourcesMock;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$rootScope_, _$httpBackend_,
                                _DriverResourcesMock_, _ResourcesMock_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should create a leaflet map', function () {
        var scope = $rootScope.$new();
        var element = $compile('<div leaflet-map recent-events></div>')(scope);

        $httpBackend.whenGET(/\/api\/boundaries/).respond(DriverResourcesMock.BoundaryResponse);
        $httpBackend.expectGET(/\/api\/recordtypes\/\?active=True/)
            .respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(/\/api\/boundarypolygons/)
            .respond(ResourcesMock.BoundaryNoGeomResponse);
        $httpBackend.expectGET(/\api\/records/).respond(200, ResourcesMock.RecordResponse);
        $httpBackend.expectGET(/\api\/records/).respond(200, ResourcesMock.RecordResponse);

        $rootScope.$digest();

        expect(element.find('div.leaflet-tile-pane').length).toEqual(1);
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });

});
