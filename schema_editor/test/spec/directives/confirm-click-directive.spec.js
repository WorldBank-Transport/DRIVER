'use strict';

describe('ase.directives: ConfirmClick', function () {
    beforeEach(module('ase.directives'));

    var $compile;
    var $rootScope;
    var $window;

    beforeEach(inject(function (_$compile_, _$rootScope_, _$window_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $window = _$window_;
    }));

    it('should display confirmation dialog on click', function () {
        var scope = $rootScope.$new();
        var element = $compile('<a ase-confirm-click="test"></a>')(scope);
        $rootScope.$apply();

        spyOn($window, 'confirm');

        element.click();

        expect($window.confirm).toHaveBeenCalled();
    });
});
