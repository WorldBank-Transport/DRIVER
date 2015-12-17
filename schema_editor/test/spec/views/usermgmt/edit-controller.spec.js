'use strict';

describe('ase.views.usermgmt: UserEditController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.views.usermgmt'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var Controller;
    var ResourcesMock;

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        ResourcesMock = _ResourcesMock_;
    }));

    it('should request user on controller initialization', function () {
        var requestUrl = /\/api\/users/;
        $httpBackend.expectGET(requestUrl).respond(200, ResourcesMock.UserInfoResponse);

        Controller = $controller('UserEditController', {
            $scope: $scope,
            $stateParams: {
                userid: 2
            }
        });
        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(Controller.user.email).toBe('test@azavea.com');
    });

    it('should derive the highest access level group to which the user belongs', function () {
        var requestUrl = /\/api\/users/;

        var responseUser = angular.extend({}, ResourcesMock.UserInfoResponse);

        console.log(responseUser);

        // 1) user has one group, which is public
        $httpBackend.expectGET(requestUrl).respond(200, responseUser);

        Controller = $controller('UserEditController', {
            $scope: $scope,
            $stateParams: {
                userid: 2
            }
        });
        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(Controller.userGroup).toBe('public');

        // 2) user belongs to both admin and public
        responseUser.groups.push('admin');

        $httpBackend.expectGET(requestUrl).respond(200, responseUser);

        Controller = $controller('UserEditController', {
            $scope: $scope,
            $stateParams: {
                userid: 2
            }
        });
        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(Controller.userGroup).toBe('admin');

        // 3) user belongs to both admin and analyst
        responseUser.groups = ['admin', 'analyst'];

        $httpBackend.expectGET(requestUrl).respond(200, responseUser);

        Controller = $controller('UserEditController', {
            $scope: $scope,
            $stateParams: {
                userid: 2
            }
        });
        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(Controller.userGroup).toBe('admin');
    });
});
