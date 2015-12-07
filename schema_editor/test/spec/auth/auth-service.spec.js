'use strict';

describe('ase.auth:AuthService', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.userdata'));
    beforeEach(module('ase.auth'));

    var $httpBackend;
    var $rootScope;
    var $q;
    var $timeout;

    var AuthService;
    var ResourcesMock;
    var UserService;
    var queryUrl = /\/api-token-auth/;

    beforeEach(function() {
        var $window;
        var $cookies;

        module(function ($provide) {
            // mock UserService
            $provide.factory('UserService', function() {
                return {
                    canWriteRecords: function() { return {
                            then: function(callback) {
                                return callback(true); // analyst
                            }
                        };
                    },
                    isAdmin: function() { return {
                            then: function(callback) {
                                return callback(false); // not an admin
                            }
                        };
                    }
                };
            });

            // avoid full page reload during test
            $window = {
                location: {},
                document: window.document,
                reload: jasmine.createSpy()
            };

            $provide.constant('$window', $window);
        });

        inject(function(_$cookies_, _$httpBackend_, _$rootScope_, _$window_, _$q_, _$timeout_,
               _AuthService_, _ResourcesMock_, _UserService_) {

            AuthService = _AuthService_;
            UserService = _UserService_;
            ResourcesMock = _ResourcesMock_;
            $httpBackend = _$httpBackend_;
            $q = _$q_;
            $timeout = _$timeout_;
            $rootScope = _$rootScope_;
            $window = _$window_;
            $cookies = _$cookies_;
            spyOn($rootScope, '$broadcast');
        });

        // clear cookies
        angular.forEach($cookies.getAll(), function(value, key) {
            $cookies.remove(key);
        });
    });

    it('should log in and back out successfully', function () {
        // log in
        $httpBackend.expectPOST(queryUrl).respond({user: 1, token: 'gotatoken'});
        AuthService.authenticate({username: 'foo', password: 'foo'}).then(function(data) {
            expect(data.isAuthenticated).toBe(true);
            expect(data.status).toBe(200);
            expect(data.error).toBeFalsy();
            expect($rootScope.$broadcast).toHaveBeenCalledWith(AuthService.events.loggedIn);
            expect(AuthService.hasWriteAccess()).toBeTruthy();
            expect(AuthService.getUserId()).toBe(1);
            expect(AuthService.getToken()).toBe('gotatoken');
        });

        $httpBackend.flush();
        $timeout.flush();

        // log out
        AuthService.logout();
        $rootScope.$digest();
        $timeout.flush();
        expect(AuthService.getUserId()).toBe(-1);
        expect(AuthService.getToken()).toBeUndefined();
        expect(AuthService.hasWriteAccess()).toBeFalsy();
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
            expect(AuthService.hasWriteAccess()).toBeFalsy();
        });

        $httpBackend.flush();
        $timeout.flush();
    });

    it('should support restricting to admin logins', function () {
        // attempt to log in with non-admin user to admin portion of site
        $httpBackend.expectPOST(queryUrl).respond({user: 1, token: 'gotatoken'});
        AuthService.authenticate({username: 'foo', password: 'foo'}, true).then(function(data) {
            expect(data.isAuthenticated).toBe(false);
            expect(data.status).toBe(200);
            expect(data.error).toBeTruthy();
            expect(AuthService.getUserId()).toBe(-1);
            expect(AuthService.getToken()).toBeUndefined();
            expect(AuthService.hasWriteAccess()).toBeFalsy();
        });

        $rootScope.$digest();
        $httpBackend.flush();
        $timeout.flush();
    });

});
