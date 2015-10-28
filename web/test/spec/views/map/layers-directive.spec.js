'use strict';

// PhantomJS doesn't support bind yet
Function.prototype.bind = Function.prototype.bind || function (thisp) {
    var fn = this;
    return function () {
        return fn.apply(thisp, arguments);
    };
};

describe('driver.views.map: Layers Directive', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.views.map'));
    beforeEach(module('driver.state'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var ResourcesMock;
    var InitialState;

    var Element;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_,
                                _ResourcesMock_, _InitialState_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        ResourcesMock = _ResourcesMock_;
        InitialState = _InitialState_;

        InitialState.setRecordTypeInitialized();
        InitialState.setBoundaryInitialized();
        InitialState.setGeographyInitialized();

        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        $httpBackend.whenGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        var boundaryUrl = /\/api\/boundaries\//;
        $httpBackend.whenGET(boundaryUrl).respond(200, ResourcesMock.BoundaryResponse);
        var boundaryPolygonsUrl = /api\/boundarypolygons/;
        $httpBackend.whenGET(boundaryPolygonsUrl).respond(200, ResourcesMock.BoundaryNoGeomResponse);
        var recordsUrl = new RegExp('api/records/\\?limit=50&polygon_id=' +
                                    ResourcesMock.BoundaryNoGeomResponse.results[0].uuid +
                                    '&record_type=' +
                                    ResourcesMock.RecordTypeResponse.results[0].uuid +
                                    '&tilekey=true');
        $httpBackend.whenGET(recordsUrl).respond(200, '{"tilekey": "xxx"}');

        Element = $compile('<div leaflet-map driver-map-layers></div>')($rootScope);
        $rootScope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    }));

    it('should load directive', function () {
        expect(Element.find('.leaflet-tile-pane').length).toBeTruthy();
        expect(Element.find('.leaflet-control-layers-selector').length).toBeTruthy();
    });
});
