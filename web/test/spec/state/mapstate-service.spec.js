'use strict';

describe('driver.state: Map', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.state'));
    beforeEach(module('driver.map-layers'));
    beforeEach(module('pascalprecht.translate'));

    var $rootScope;
    var $httpBackend;
    var MapState;
    var BaseLayersService;
    var LocalStorageService;

    beforeEach(inject(function (_$rootScope_, _$httpBackend_, _MapState_, _BaseLayersService_,
                                _localStorageService_) {
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        MapState = _MapState_;
        BaseLayersService = _BaseLayersService_;
        LocalStorageService = _localStorageService_;
    }));

    it('should set and get FilterGeoJSON', function () {
        expect(MapState.getFilterGeoJSON()).toBeUndefined();
        MapState.setFilterGeoJSON('asdf');
        expect(MapState.getFilterGeoJSON()).toBe('asdf');
    });

    it('should return default zoomlevel when none has been set', function () {
        expect(MapState.getZoom()).toEqual(5);
    });

    it('should set and get zoomlevel', function () {
        MapState.setZoom(1);
        expect(MapState.getZoom()).toBe(1);
    });

    it('should set and get location', function () {
        expect(MapState.getLocation()).toBeUndefined();
        MapState.setLocation({'loc': 1});
        expect(MapState.getLocation()).toEqual({'loc': 1});
    });

    it('should have a local storage provider', function () {
        expect(LocalStorageService).toBeDefined();
    });

    it('should return a default base map selection when none is set', function () {
        expect(LocalStorageService.get('map.baseLayerName')).toBeNull();
        expect(MapState.getBaseLayerSlugLabel()).toEqual(BaseLayersService.baseLayers()[0].slugLabel);
    });

    it('should set, get, and store base map selection', function () {
        MapState.setBaseLayerSlugLabel('satellite');
        expect(MapState.getBaseLayerSlugLabel()).toEqual('satellite');
        expect(LocalStorageService.get('map.baseLayerSlugLabel')).toEqual('satellite');
    });

});
