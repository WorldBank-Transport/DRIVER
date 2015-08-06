'use strict';

describe('driver.views.account: AccountController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.views.account'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var Controller;
    var DriverResourcesMock;
    var ResourcesMock;

    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _DriverResourcesMock_, _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should pass this placeholder test', function () {
        Controller = $controller('AccountController', { $scope: $scope });
        $scope.$apply();
    });
});
