'use strict';

describe('ase.notifications: Directive', function () {
    beforeEach(module('ase.templates'));
    beforeEach(module('ase.notifications'));

    var $compile;
    var $rootScope;

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should load directive', function () {
        var scope = $rootScope.$new();
        var element = $compile('<ase-notifications></ase-notifications>')(scope);
        $rootScope.$apply();

        expect(element.find('table').length).toEqual(1);
    });

});
