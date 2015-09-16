'use strict';

describe('driver.state: Records', function () {

    beforeEach(module('driver.state'));

    var $rootScope;
    var FilterState;
    var LocalStorageService;

    beforeEach(inject(function (_$rootScope_, _FilterState_, _localStorageService_) {
        $rootScope = _$rootScope_;
        FilterState = _FilterState_;
        LocalStorageService = _localStorageService_;

        spyOn($rootScope, '$broadcast');
    }));

    it('should have a local storage provider', function () {
        expect(LocalStorageService).toBeDefined();
    });

    it('should load back saved filters', function () {
        var filter = {'foo#bar': 'baz', 'amplifier': 11};
        FilterState.saveFilters(filter);
        expect(LocalStorageService.get('filterbar.filters')).toEqual(JSON.stringify(filter));
        FilterState.restoreFilters();
        expect($rootScope.$broadcast).toHaveBeenCalledWith('driver.filterbar:restore', filter);
    });

});
