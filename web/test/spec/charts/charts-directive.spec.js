'use strict';

describe('driver.tools.charts: Charts', function () {

    beforeEach(module('ase.templates'));
    beforeEach(module('driver.tools.charts'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $rootScope;

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should load toddow and stepwise charts', function () {
        var scope = $rootScope.$new();
        var element = $compile('<driver-charts></driver-charts>')(scope);
        $rootScope.$apply();

        expect(element.find('.day').length).toBeGreaterThan(6);
        expect(element.find('.hour').length).toBeGreaterThan(167);

        // TODO: add this back in when stepwise aggregation is implemented
        //expect(element.find('g.outer').length).toBe(1);
    });
});
