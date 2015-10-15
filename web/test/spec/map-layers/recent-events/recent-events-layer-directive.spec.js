'use strict';

describe('driver.map-layers.recent-events: Recent Events Layer Directive', function () {
    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.map-layers.recent-events'));

    var $compile;
    var $rootScope;
    var $httpBackend;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$rootScope_, _$httpBackend_, _ResourcesMock_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should create a leaflet map', function () {
        var scope = $rootScope.$new();
        var element = $compile('<div leaflet-map recent-events></div>')(scope);

        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        // TODO: Figure out why some many duplicate requests are occurring and remove.
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(/\/api\/boundarypolygons/).respond(ResourcesMock.BoundaryNoGeomResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(/\api\/records/).respond(200, ResourcesMock.RecordResponse);
        $httpBackend.expectGET(/\api\/records/).respond(200, ResourcesMock.RecordResponse);
        $httpBackend.expectGET(/\api\/records/).respond(200, ResourcesMock.RecordResponse);
        $httpBackend.expectGET(/\api\/records/).respond(200, ResourcesMock.RecordResponse);

        $rootScope.$digest();

        expect(element.find('div.leaflet-tile-pane').length).toEqual(1);
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });

});
