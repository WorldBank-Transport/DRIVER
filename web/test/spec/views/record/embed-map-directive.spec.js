'use strict';

describe('driver.views.record: Embedded Map Directive', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.views.record'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var Controller;
    var Element;
    var RecordTypes;
    var ResourcesMock;
    var DriverResourcesMock;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_,
                                _RecordTypes_, _DriverResourcesMock_, _ResourcesMock_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        RecordTypes = _RecordTypes_;
        ResourcesMock = _ResourcesMock_;
        DriverResourcesMock = _DriverResourcesMock_;

        // create element with directive
        $scope = $rootScope.$new();
        Element = $compile('<div class="map" leaflet-map driver-embed-map></div>')($scope);
        $rootScope.$apply();
    }));

    it('should load directive with map', function() {
        expect(Element.find('.leaflet-tile-pane').length).toEqual(1);
    });
});
