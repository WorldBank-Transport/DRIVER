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
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);

        $rootScope.$digest();
        $rootScope.$digest();

        // placeholder test
        expect(element.find('div.leaflet-tile-pane').length).toEqual(1);
    });

});
