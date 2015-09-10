'use strict';

describe('driver.filterbar: Options', function () {

    beforeEach(module('ase.templates'));
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
        $compile('<div options-field></div>')(scope);
        expect($rootScope.$apply).toThrow();
    });

});
