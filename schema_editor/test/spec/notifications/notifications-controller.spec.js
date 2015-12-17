'use strict';

describe('ase.notifications: NotificationsController', function () {
    beforeEach(module('ase.notifications'));

    var $controller;
    var $rootScope;
    var $scope;
    var $timeout;
    var Controller;

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$rootScope_, _$timeout_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $timeout = _$timeout_;
    }));

    it('should set active to true when ase.notifications.show is broadcast', function () {
        Controller = $controller('NotificationsController', {
            $scope: $scope
        });
        $scope.$apply();
        expect(Controller.active).toBe(undefined);
        $rootScope.$broadcast('ase.notifications.show', {});
        expect(Controller.active).toBe(true);
    });

    it('should save the alert options sent to it', function () {
        Controller = $controller('NotificationsController', {
            $scope: $scope
        });
        $scope.$apply();
        $rootScope.$broadcast('ase.notifications.show', {customAttribute: 'Borgle'});
        expect(Controller.alert).toBeDefined();
        expect(Controller.alert.customAttribute).toBeDefined();
        expect(Controller.alert.customAttribute).toBe('Borgle');
    });

    it('The alert should be hidden after a timeout if the timeout parameter is set', function () {
        Controller = $controller('NotificationsController', {
            $scope: $scope
        });
        $scope.$apply();
        $rootScope.$broadcast('ase.notifications.show', { timeout: 1000 });
        expect(Controller.active).toBe(true);
        $timeout(function() {
            expect(Controller.active).toBe(false);
        }, 2000);
    });
});
