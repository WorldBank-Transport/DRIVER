'use strict';

describe('Leaflet: Map Directive', function () {

    beforeEach(module('Leaflet'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $rootScope;

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should load directive', function () {
        var scope = $rootScope.$new();
        var element = $compile('<div leaflet-map></div>')(scope);
        $rootScope.$apply();

        expect(element.find('.leaflet-map-pane').length).toEqual(1);
    });
});
