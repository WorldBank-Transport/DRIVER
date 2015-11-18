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
        var boundaryUrl = /\/api\/boundaries\//;
        var boundaryPolygonsUrl = /api\/boundarypolygons/;
        var recordsUrl = /\/api\/records\//;
        var recordSchemaUrl = /\/api\/recordschemas/;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(boundaryUrl).respond(200, ResourcesMock.BoundaryResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordSchemaUrl).respond(200, ResourcesMock.RecordSchema);
        $httpBackend.expectGET(boundaryPolygonsUrl).respond(200, ResourcesMock.BoundaryNoGeomResponse);
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

        var expected = '<div id="record-popup" class="record-popup"><div><h5>Accident Details</h5><h3>Thu Jul 30 17:36:29 2015</h3><a ng-click="showDetailsModal(\'35d74ce1-7b08-486b-b791-da9bc1e93cfb\')"><span class="glyphicon glyphicon-log-in"></span> View</a><a href="/#!/record/35d74ce1-7b08-486b-b791-da9bc1e93cfb/edit" target="_blank"><span class="glyphicon glyphicon-pencil"></span> Edit</a></div></div>';

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
