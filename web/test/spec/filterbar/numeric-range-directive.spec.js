'use strict';

describe('driver.filterbar: Numeric Range', function () {

    beforeEach(module('driver.filterbar'));
    beforeEach(module('driver.state'));

    var $compile;
    var $rootScope;

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;

    }));

    it('should throw an error if required controller is not its parent', function () {
        var scope = $rootScope.$new();
        $compile('<driver-filterbar></driver-filterbar>')(scope);
        expect($rootScope.$apply).toThrow();
    });
});
