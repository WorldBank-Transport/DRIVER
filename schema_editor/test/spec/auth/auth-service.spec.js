'use strict';

describe('ase.auth:AuthService', function () {
    beforeEach(module('ase.auth'));

    var $httpBackend;
    var $rootScope;

    var AuthService;
    var queryUrl = /\/api-token-auth/;

    beforeEach(function() {
        var $window;
        var $cookies;
        inject(function(_$cookies_, _$httpBackend_, _$rootScope_, _$window_, _AuthService_) {
            AuthService = _AuthService_;
            $httpBackend = _$httpBackend_;
            $rootScope = _$rootScope_;
            $window = _$window_;
            $cookies = _$cookies_;
            spyOn($rootScope, '$broadcast');
        });

        // clear cookies
        angular.forEach($cookies.getAll(), function(value, key) {
            $cookies.remove(key);
        });

        $window.location.reload = jasmine.createSpy();  // avoid full page reload during test
    });

    it('should log in and back out successfully', function () {
        // log in
        $httpBackend.expectPOST(queryUrl).respond({user: 1, token: 'gotatoken'});
        AuthService.authenticate({username: 'foo', password: 'foo'}).then(function(data) {
            expect(data.isAuthenticated).toBe(true);
            expect(data.status).toBe(200);
            expect(data.error).toBeFalsy();
            expect(AuthService.getUserId()).toBe(1);
            expect(AuthService.getToken()).toBe('gotatoken');
        });

        $httpBackend.flush();
        expect($rootScope.$broadcast).toHaveBeenCalledWith(AuthService.events.loggedIn);

        // log out
        AuthService.logout();
        $rootScope.$digest();
        expect(AuthService.getUserId()).toBe(-1);
        expect(AuthService.getToken()).toBeUndefined();
        expect($rootScope.$broadcast).toHaveBeenCalledWith(AuthService.events.loggedOut);
    });

    it('should handle authentication failure', function () {
        $httpBackend.expectPOST(queryUrl).respond(400, {password: ['This field may not be blank.']});

        AuthService.authenticate({username: 'foo'}).then(function(data) {
            expect(data.isAuthenticated).toBe(false);
            expect(data.status).toBe(400);
            expect(data.error).toBe('Password field required.');
            expect(AuthService.getUserId()).toBe(-1);
            expect(AuthService.getToken()).toBeUndefined();
        });

        $httpBackend.flush();
    });

});
