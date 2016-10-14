'use strict';

describe('driver.state: Zoom to Boundary Directive', function () {
    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.state'));
    beforeEach(module('Leaflet'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var ResourcesMock;
    var Element;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_, _ResourcesMock_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        ResourcesMock = _ResourcesMock_;
        $scope = $rootScope.$new();
        Element = $compile('<div class="map" leaflet-map zoom-to-boundary></div>')($scope);
        $httpBackend.expectGET(/\/api\/boundaries/)
            .respond(ResourcesMock.GeographyResponse);
        $httpBackend.expectGET(/\/api\/boundarypolygons/)
            .respond(ResourcesMock.BoundaryNoGeomResponse);
        $rootScope.$apply();
    }));

    it('should zoom on boundary changed events', function() {
        var controller = Element.controller('leafletMap');
        controller.getMap().then(function(map) {
            spyOn(map, 'fitBounds');
            $rootScope.$broadcast('driver.state.boundarystate:selected',
                {bbox: [{lat: 0, lon: 0}, {lat: 1, lon: 1}]}
            );
            expect(map.fitBounds).toHaveBeenCalled();
        });
    });
});
