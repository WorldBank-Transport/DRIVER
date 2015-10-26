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

    it('should load directive with text message', function () {
        var scope = $rootScope.$new();
        var element = $compile('<ase-notifications></ase-notifications>')(scope);
        $rootScope.$apply();

        $rootScope.$broadcast('ase.notifications.show', {text: 'Danger, Will Robinson!'});
        $rootScope.$apply();

        expect(element.find('table').length).toEqual(1);
    });

    it('should load directive with HTML message', function () {
        var scope = $rootScope.$new();
        var element = $compile('<ase-notifications></ase-notifications>')(scope);
        $rootScope.$apply();

        $rootScope.$broadcast('ase.notifications.show', {html: '<p>Danger, Will Robinson!</p>'});
        $rootScope.$apply();

        expect(element.find('div[ng-bind-html]').length).toEqual(1);
    });

});
