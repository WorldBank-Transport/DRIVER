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
    var DriverResourcesMock;

    beforeEach(inject(function (_$compile_, _$controller_, _$httpBackend_, _$rootScope_,
                                _DriverResourcesMock_) {
        $compile = _$compile_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        DriverResourcesMock = _DriverResourcesMock_;

        Element = $compile('<div leaflet-map driver-map-layers></div>')($scope);
        Controller = Element.controller('driverMapLayers');
        $rootScope.$apply();
    }));

    it('should have a controller', function () {
        expect(Controller).toBeDefined();
    });

    it('should build a popup', function () {
        expect(Controller.buildRecordPopup).toBeDefined();

        var record = DriverResourcesMock.RecordResponse.results[0];
        // JSONB from record is returned as string from UTFGrid
        record.data = JSON.stringify(record.data);

        var expected = '<div class="record-popup"><h3>testlabel</h3><div><p>Occurred on: 2015-07-30T17:36:29.263000Z</p><h4>Person</h4><div style="margin:15px;"></div><h4>Crime Details</h4><div style="margin:15px;"><p>County: Philadelphia</p><p>Description: First test</p><p>District: 13</p><p>_localId: e116f30b-e493-4d57-9797-a901abddf7d5</p></div><h4>Vehicle</h4><div style="margin:15px;"></div></div></div>';

        var popup = Controller.buildRecordPopup(record);
        expect(popup).toEqual(expected);
    });

});
