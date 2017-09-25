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
    beforeEach(module('pascalprecht.translate'));

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
        // var recordsUrl = /\/api\/records\/.*record_type/;
        var tilekeyUrl = /\/api\/records\/\?.*tilekey=true/;
        var recordSchemaUrl = /\/api\/recordschemas\/[a-e0-9-]+/;
        var blackspotUrl = /\/api\/blackspotsets/;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(boundaryUrl).respond(200, DriverResourcesMock.BoundaryResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordSchemaUrl).respond(200, ResourcesMock.RecordSchema);
        $httpBackend.expectGET(blackspotUrl).respond(200, ResourcesMock.BlackspotResponse);
        $httpBackend.expectGET(boundaryPolygonsUrl).respond(200, ResourcesMock.BoundaryNoGeomResponse);

        // Two record layers (primary and secondary), each gets called once on init then once
        // triggered by the filterbar loading
        $httpBackend.expectGET(tilekeyUrl).respond(200, '{"tilekey": "xxx"}');
        $httpBackend.expectGET(tilekeyUrl).respond(200, '{"tilekey": "xxx"}');
        $httpBackend.expectGET(tilekeyUrl).respond(200, '{"tilekey": "xxx"}');
        $httpBackend.expectGET(tilekeyUrl).respond(200, '{"tilekey": "xxx"}');

        $httpBackend.expectGET(blackspotUrl).respond(200, ResourcesMock.BlackspotResponse);

        Element = $compile('<div leaflet-map driver-map-layers></div>')($scope);
        Controller = Element.controller('driverMapLayers');
        $rootScope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    }));

    it('should have a controller', function () {
        expect(Controller).toBeDefined();
    });

    it('should build a record popup', function () {
        expect(Controller.buildRecordPopup).toBeDefined();

        var record = DriverResourcesMock.RecordResponse.results[0];
        // JSONB from record is returned as string from UTFGrid
        record.data = JSON.stringify(record.data);

        var expected = '<div id="record-popup" class="record-popup"><div><h5>Incident RECORD.DETAILS</h5><h3>7/31/2015, 1:36:29</h3><a ng-click="showDetailsModal(\'35d74ce1-7b08-486b-b791-da9bc1e93cfb\')"><span class="glyphicon glyphicon-log-in"></span> COMMON.VIEW</a></div></div>';

        var popup = Controller.buildRecordPopup(record, { label: Controller.recordType.label });
        expect(popup).toEqual(expected);
    });

    it('should build a blackspot popup', function () {
        expect(Controller.buildBlackspotPopup).toBeDefined();

        var blackspot = DriverResourcesMock.BlackspotResponse.results[0];
        // JSONB from record is returned as string from UTFGrid
        blackspot.data = JSON.stringify(blackspot.data);

        var expected = '<div id="blackspot-popup" class="blackspot-popup"><div><h4>MAP.BLACKSPOT</h4></div><div><h6>MAP.SEVERITY_SCORE: severity_score</h6></div><div><h6>Incidents: num_records</h6></div><div><h6>MAP.NUM_SEVERE: num_severe</h6></div>';

        var popup = Controller.buildBlackspotPopup(blackspot);
        expect(popup).toEqual(expected);
    });

    it('should listen for record type change', function() {
        spyOn(Controller, 'setRecordLayers');
        RecordState.setSelected(ResourcesMock.RecordTypeResponse.results[2]);
        expect(Controller.setRecordLayers).toHaveBeenCalled();
    });

    it('should restore state when certain props are set on MapState', function() {
        expect(Controller.map.getCenter()).toEqual({lat: 123, lng: 234});
        expect(Controller.map.getZoom()).toEqual(7);
    });

});
