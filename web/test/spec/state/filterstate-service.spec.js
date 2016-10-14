'use strict';

describe('driver.state: Records', function () {

    beforeEach(module('driver.state'));
    beforeEach(module('pascalprecht.translate'));

    var $rootScope;
    var $timeout;
    var FilterState;
    var LocalStorageService;

    beforeEach(inject(function (_$rootScope_, _$timeout_, _FilterState_, _localStorageService_) {
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        FilterState = _FilterState_;
        LocalStorageService = _localStorageService_;

        spyOn($rootScope, '$broadcast');
    }));

    it('should have a local storage provider', function () {
        expect(LocalStorageService).toBeDefined();
    });

    it('should load back saved filters', function () {
        var filter = {'foo#bar': 'baz', 'amplifier': 11};
        var geoFilter = null;

        FilterState.restoreFilters();
        FilterState.saveFilters(filter, geoFilter);
        $timeout.flush();
        expect(LocalStorageService.get('filterbar.filters')).toEqual(filter);
        FilterState.restoreFilters();
        expect($rootScope.$broadcast).toHaveBeenCalledWith('driver.filterbar:restore', [filter, geoFilter]);
    });

});
