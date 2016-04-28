'use strict';

describe('driver.blackSpots: BlackSpotsController', function() {

    beforeEach(module('driver.blackSpots'));
    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.views.map'));
    beforeEach(module('driver.state'));
    beforeEach(module('pascalprecht.translate'));

    var $controller;
    var $rootScope;
    var $scope;
    var $httpBackend;
    var ResourcesMock;
    var DriverResourcesMock;
    var Controller;
    var Element;
    var $compile;
    var InitialState;
    var MapState;

    beforeEach(inject(function(
        _$controller_, _$httpBackend_, _$rootScope_, _ResourcesMock_,
        _$compile_, _InitialState_, _MapState_, _DriverResourcesMock_
    ) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        ResourcesMock = _ResourcesMock_;
        DriverResourcesMock = _DriverResourcesMock_;
        InitialState = _InitialState_;
        MapState = _MapState_;

        InitialState.setRecordTypeInitialized();
        InitialState.setBoundaryInitialized();
        InitialState.setGeographyInitialized();
        InitialState.setLanguageInitialized();

        MapState.setLocation({
            lat: 123,
            lng: 234
        });
        MapState.setZoom(7);

        var recordTypeUrl = /\/api\/recordtypes\//;
        var boundaryUrl = /\/api\/boundaries\//;
        var blackspotUrl = /\/api\/blackspotsets\//;
        var boundaryPolygonsUrl = /\/api\/boundarypolygons/;

        $httpBackend.expectGET(recordTypeUrl)
            .respond(200, ResourcesMock.RecordTypeResponse);

        $httpBackend.expectGET(boundaryUrl)
            .respond(200, DriverResourcesMock.BoundaryResponse);

        $httpBackend.expectGET(recordTypeUrl)
            .respond(200, ResourcesMock.RecordTypeResponse);

        $httpBackend.expectGET(boundaryPolygonsUrl)
            .respond(200, ResourcesMock.BoundaryNoGeomResponse);

        $httpBackend.expectGET(blackspotUrl)
            .respond(200, DriverResourcesMock.BlackspotSetResponse);

        Element = $compile('<div leaflet-map driver-black-spots></div>')($scope);
        Controller = Element.controller('driverBlackSpots');
        $rootScope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    }));

    it('should have a controller', function() {
        expect(Controller).toBeDefined();
    });
});
