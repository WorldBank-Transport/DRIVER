'use strict';

describe('ase.notifications: Notifications', function () {

    beforeEach(module('ase.notifications'));

    var Notifications;
    var $rootScope;

    beforeEach(inject(function (_$rootScope_, _Notifications_) {
        $rootScope = _$rootScope_;
        Notifications = _Notifications_;
    }));

    it('should store and clear the most recently created alert', function () {
        expect(Notifications.activeAlert()).toBeNull();
        Notifications.show({customAttribute: 'Borgle'});
        var activeAlert = Notifications.activeAlert();
        expect(activeAlert).toBeDefined();
        expect(activeAlert).not.toBeNull();
        expect(activeAlert.customAttribute).toBeDefined();
        expect(activeAlert.customAttribute).toBe('Borgle');
        Notifications.hide();
        expect(Notifications.activeAlert()).toBeNull();
    });

    it('should emit the correct event when show is called', function () {
        spyOn($rootScope, '$broadcast');
        Notifications.show({});
        expect($rootScope.$broadcast).toHaveBeenCalledWith('ase.notifications.show',
            jasmine.any(Object) // Don't check the default values here.
        );
    });

    it('should set sane defaults on newly created alerts', function () {
        Notifications.show({});
        var created = Notifications.activeAlert();
        expect(created.timeout).toBe(0);
        expect(created.closeButton).toBe(true);
        expect(created.text).toBe('');
        expect(created.imageClass).toBe('glyphicon-warning-sign');
        expect(created.displayClass).toBe('alert-info');
    });
});

