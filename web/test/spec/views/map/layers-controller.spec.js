'use strict';

// PhantomJS doesn't support bind yet
Function.prototype.bind = Function.prototype.bind || function (thisp) {
    var fn = this;
    return function () {
        return fn.apply(thisp, arguments);
    };
};

describe('driver.views.map: Layers Controller', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.views.map'));
    beforeEach(module('driver.state'));

    var $compile;
    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;

    var Controller;
    var Element;
    var ResourcesMock;
    var DriverResourcesMock;
    var RecordState;
    var MapState;
    var InitialState;

    beforeEach(inject(function (_$compile_, _$controller_, _$httpBackend_, _$rootScope_,
                                _ResourcesMock_, _DriverResourcesMock_,
                                _RecordState_, _MapState_, _InitialState_) {
        $compile = _$compile_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
        RecordState = _RecordState_;
        MapState = _MapState_;
        InitialState = _InitialState_;

        InitialState.setRecordTypeInitialized();
        InitialState.setBoundaryInitialized();
        InitialState.setGeographyInitialized();

        // Set these for testing persistence
        MapState.setLocation({lat: 123, lng: 234});
        MapState.setZoom(7);

        var recordTypeUrl = /\/api\/recordtypes\//;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        var boundaryUrl = /\/api\/boundaries\//;
        $httpBackend.expectGET(boundaryUrl).respond(200, ResourcesMock.BoundaryResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        var boundaryPolygonsUrl = /api\/boundarypolygons/;
        $httpBackend.expectGET(boundaryPolygonsUrl).respond(200, ResourcesMock.BoundaryNoGeomResponse);
        var recordsUrl = /\/api\/records\//;
        $httpBackend.expectGET(recordsUrl).respond(200, '{"tilekey": "xxx"}');
        $httpBackend.expectGET(recordsUrl).respond(200, '{"tilekey": "xxx"}');

        Element = $compile('<div leaflet-map driver-map-layers></div>')($scope);
        Controller = Element.controller('driverMapLayers');
        $rootScope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    }));

    it('should have a controller', function () {
        expect(Controller).toBeDefined();
    });

    it('should build a popup', function () {
        expect(Controller.buildRecordPopup).toBeDefined();

        var record = DriverResourcesMock.RecordResponse.results[0];
        // JSONB from record is returned as string from UTFGrid
        record.data = JSON.stringify(record.data);

        var expected = '<div class="record-popup"><div><h3>Occurred on: 2015-07-30T17:36:29.263000Z</h3><h4>Person</h4><div style="margin:15px;"></div><h4>Crime Details</h4><div style="margin:15px;"><p>County: Philadelphia</p><p>Description: First test</p><p>District: 13</p></div><h4>Vehicle</h4><div style="margin:15px;"></div></div></div>';

        var popup = Controller.buildRecordPopup(record);
        expect(popup).toEqual(expected);
    });

    it('should listen for record type change', function() {
        spyOn(Controller, 'setRecordLayers');
        RecordState.setSelected({uuid: 'foo'});
        expect(Controller.setRecordLayers).toHaveBeenCalled();
    });

    it('should restore state when certain props are set on MapState', function() {
        expect(Controller.map.getCenter()).toEqual({lat: 123, lng: 234});
        expect(Controller.map.getZoom()).toEqual(7);
    });

});
