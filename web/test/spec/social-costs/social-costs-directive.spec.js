'use strict';

describe('driver.socialCosts: SocialCosts', function () {

    beforeEach(module('ase.templates'));
    beforeEach(module('driver.socialCosts'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $rootScope;

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should load directive', function () {
        var scope = $rootScope.$new();
        var element = $compile('<driver-social-costs cost-data="{\'total\': 0}"></driver-social-costs>')(scope);
        $rootScope.$apply();

        expect(element.find('h1').length).toEqual(1);
        expect(element.find('h2').length).toEqual(1);
    });
});
