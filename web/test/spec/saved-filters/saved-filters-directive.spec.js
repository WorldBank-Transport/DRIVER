'use strict';

describe('driver.savedFilters: SavedFilters', function () {

    beforeEach(module('ase.templates'));
    beforeEach(module('driver.savedFilters'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $rootScope;

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should load directive', function () {
        var scope = $rootScope.$new();
        var element = $compile('<driver-saved-filters></driver-saved-filters>')(scope);
        $rootScope.$apply();

        expect(element.find('tr').length).toEqual(1);
    });
});
