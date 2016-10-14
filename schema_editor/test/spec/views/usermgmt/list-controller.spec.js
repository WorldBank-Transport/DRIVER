'use strict';

describe('ase.views.usermgmt: UserListController', function () {

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

    it('should request users on controller initialization', function () {
        var requestUrl = /\/api\/users/;
        $httpBackend.expectGET(requestUrl).respond(200, ResourcesMock.UsersResponse);

        Controller = $controller('UserListController', {
            $scope: $scope
        });
        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(Controller.users.length).toBe(2);
    });
});
