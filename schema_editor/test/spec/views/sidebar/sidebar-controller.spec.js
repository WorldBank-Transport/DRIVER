'use strict';

describe('ase.views.sidebar: SidebarController', function () {

    beforeEach(module('ase.views.sidebar'));

    var SidebarController;
    var rootScope;
    var scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
    }));

    describe('tests for sidebar controller', function () {
        beforeEach(inject(function ($controller) {
            SidebarController = $controller('SidebarController', {
                $scope: scope
            });
        }));

        it('should be a dummy test', function () {
            expect(true).toEqual(true);
        });
    });
});
