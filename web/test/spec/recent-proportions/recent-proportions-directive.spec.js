'use strict';

describe('driver.recentProportions: RecentProportions', function () {

    beforeEach(module('ase.templates'));
    beforeEach(module('driver.recentProportions'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $rootScope;

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should load directive', function () {
        var scope = $rootScope.$new();
        var element = $compile('<driver-recent-proportions></driver-recent-proportions>')(scope);
        $rootScope.$apply();

        expect(element.find('li').length).toEqual(3);
    });
});
