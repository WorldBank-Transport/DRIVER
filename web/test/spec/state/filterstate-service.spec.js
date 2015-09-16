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
    }));

    it('should have a local storage provider', function () {
        expect(LocalStorageService).toBeDefined();
    });

});
