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

    var $compile;
    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;

    var Controller;
    var Element;

    beforeEach(inject(function (_$compile_, _$controller_, _$httpBackend_, _$rootScope_) {
        $compile = _$compile_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;

        Element = $compile('<div leaflet-map driver-map-layers></div>')($scope);
        $rootScope.$apply();

        Controller = Element.controller('driverMapLayers');
    }));

    it('should have a controller', function () {
        expect(Controller).toBeDefined();
    });

});
