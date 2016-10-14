'use strict';

describe('driver.views.record: Embedded Map Controller', function () {

    beforeEach(module('driver.views.record'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var $timeout;

    var Controller;

    var snippet = ['<div class="map" leaflet-map driver-embed-map ',
                   'editable="true" lat=11.1 lng=121.8></div>'].join('');

    beforeEach(inject(function (_$compile_, _$controller_, _$httpBackend_, _$rootScope_, _$timeout_) {
        $compile = _$compile_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;

        var Element = $compile(snippet)($scope);
        $rootScope.$apply();

        // find the controller by name
        Controller = Element.controller('driverEmbedMap');
    }));

    it('should have a map on the controller', function() {
        expect(Controller.map).toBeDefined();
    });

    it('should be editable', function() {
        expect(Controller.isEditable).toBeTruthy();
    });

    it('should initialize marker with attribute coordinates', function() {
        expect(Controller.locationMarker).toBeDefined();
        expect(Controller.locationMarker.getLatLng()).toEqual({lat: 11.1, lng: 121.8});
    });

    it('should broadcast map click coordinates as [lng, lat]', function() {
        var lat = 11.3;
        var lng = 124.2;
        var latlng = L.latLng(lat, lng);

        spyOn($rootScope, '$broadcast').and.callThrough();
        Controller.map.fireEvent('click', {latlng: latlng});

        // Clicking doesn't immediately move the marker; it waits 300ms to see if the click
        // was actually the beginning of a double-click.
        $timeout.flush(); // Synchronously resolve all timeouts immediately.
        expect($rootScope.$broadcast).toHaveBeenCalled();
        expect($rootScope.$broadcast).toHaveBeenCalledWith('driver.views.record:marker-moved',
                                                           [lng, lat]);
    });

    it('should not broadcast map click coordinates on double-click', function() {
        var lat = 11.3;
        var lng = 124.2;
        var latlng = L.latLng(lat, lng);

        spyOn($rootScope, '$broadcast').and.callThrough();
        Controller.map.fireEvent('click', {latlng: latlng});
        Controller.map.fireEvent('click', {latlng: latlng});

        // Clicking doesn't immediately move the marker; it waits 300ms to see if the click
        // was actually the beginning of a double-click. In this case, there should have been
        // two clicks, so the marker should never move.
        $timeout.flush();
        expect($rootScope.$broadcast).not.toHaveBeenCalled();
    });

    it('should destroy map and marker on record close event', function() {
        // should have a map to start with
        expect(Controller.map).toBeDefined();

        $rootScope.$broadcast('driver.views.record:close');

        // should have no map or marker after record close event
        expect(Controller.map).toBeNull();
        expect(Controller.locationMarker).toBeNull();
    });
});
