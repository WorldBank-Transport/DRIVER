'use strict';

describe('driver.state: Map', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.state'));

    var $rootScope;
    var $httpBackend;
    var MapState;

    beforeEach(inject(function (_$rootScope_, _$httpBackend_, _MapState_) {
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        MapState = _MapState_;
    }));

    it('should make a request for state options on call to "updateOptions"', function () {
        MapState.setFilterGeoJSON('asdf');
        expect(MapState.getFilterGeoJSON()).toBe('asdf');

        MapState.setZoom(1);
        expect(MapState.getZoom()).toBe(1);

        MapState.setLocation({'loc': 1});
        expect(MapState.getLocation()).toEqual({'loc': 1});
    });

});
