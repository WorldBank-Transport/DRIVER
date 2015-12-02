'use strict';

describe('driver.views.account: AccountController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('ase.userdata'));
    beforeEach(module('ase.auth'));
    beforeEach(module('driver.views.account'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var AuthService;
    var Controller;
    var DriverResourcesMock;
    var ResourcesMock;
    var UserInfo;

    beforeEach(function() {

        module(function ($provide) {
            // mock UserService
            $provide.factory('UserService', function() {
                return {
                    isAdmin: function() { return {
                            then: function(callback) {
                                return callback(false); // not an admin
                            }
                        };
                    }
                };
            });
        });

        inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _DriverResourcesMock_, _ResourcesMock_, _AuthService_) {
            $controller = _$controller_;
            $httpBackend = _$httpBackend_;
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            DriverResourcesMock = _DriverResourcesMock_;
            ResourcesMock = _ResourcesMock_;
            UserInfo = ResourcesMock.UserInfoResponse;
            AuthService = _AuthService_;

            // log in first
            var queryUrl = /\/api-token-auth/;
            $httpBackend.expectPOST(queryUrl).respond({user: 1, token: 'gotatoken'});
            AuthService.authenticate({username: 'foo', password: 'foo'});
            $httpBackend.flush();
            $rootScope.$digest();
        });
    });

    it('should load user information', function () {

        Controller = $controller('AccountController', {
            $scope: $scope,
            UserInfo: UserInfo,
            AuthService: AuthService,
        });
        $scope.$apply();

        expect($scope.userInfo.email).toBe('test@azavea.com');
    });
});
