'use strict';

describe('driver.views.map: Map', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.views.map'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $httpBackend;
    var $rootScope;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
    }));

    it('should load directive', function () {
        var $scope = $rootScope.$new();
        var element = $compile('<div leaflet-map driver-map></div>')($scope);
        $rootScope.$apply();

        expect(element.find('.leaflet-tile-pane').length).toEqual(1);
    });
});
