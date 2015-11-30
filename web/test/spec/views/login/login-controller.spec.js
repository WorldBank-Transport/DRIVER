'use strict';

// PhantomJS doesn't support bind yet
Function.prototype.bind = Function.prototype.bind || function (thisp) {
    var fn = this;
    return function () {
        return fn.apply(thisp, arguments);
    };
};

describe('driver.views:AuthController', function () {
    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.resources'));
    beforeEach(module('driver.views.login'));

    var $httpBackend;
    var $injector = angular.injector(['ase.auth']);
    var $q;
    var $scope;
    var fakeWindow;

    var Controller;
    var Service;
    var DriverResourcesMock;

    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_, _$q_, _$state_,
                                _$window_, _DriverResourcesMock_, _WebConfig_) {

        $httpBackend = _$httpBackend_;
        $q = _$q_;
        $scope = _$rootScope_.$new();

        // fake the window because of full page reload after login
        fakeWindow = { location: {href: '/'}, document: _$window_.document};

        Service = $injector.get('AuthService');

        DriverResourcesMock = _DriverResourcesMock_;

        Controller = _$controller_('AuthController', {
            $scope: $scope,
            $state: _$state_,
            $window: fakeWindow,
            AuthService: Service,
            SSOClients: DriverResourcesMock.SSOClientsResponse,
            WebConfig: _WebConfig_
        });
    }));

    it('should add and close alerts', function () {
        $scope.addAlert('foo');
        $scope.addAlert('bar');
        $scope.addAlert('baz');

        expect($scope.alerts.length).toBe(3);

        $scope.closeAlert(1);
        expect($scope.alerts).toEqual(['foo', 'baz']);
    });

    it('should call auth service to authenticate successfully', function () {
        var auth = {username: 'foo', password: 'foo'};
        $scope.auth = auth;

        spyOn(Service, 'authenticate').and.callFake(function() {
            var dfd = $q.defer();
            dfd.resolve({status: 200, error: '', isAuthenticated: true});
            return dfd.promise;
        });

        $httpBackend.expectGET('scripts/views/login/login-partial.html').respond(200);
        $scope.authenticate();
        $scope.$digest();
        expect(Service.authenticate).toHaveBeenCalledWith(auth);
        expect($scope.auth.failure).toBeUndefined();
    });

    it('should handle authentication failure', function () {

        var auth = {username: 'foo'};
        $scope.auth = auth;

        spyOn(Service, 'authenticate').and.callFake(function() {
            var dfd = $q.defer();
            dfd.resolve({isAuthenticated: false, status: 400, error: 'Password field required.'});
            return dfd.promise;
        });

        $scope.authenticate();
        $scope.$digest();
        expect(Service.authenticate).toHaveBeenCalledWith(auth);
        expect($scope.auth.failure).toBe(true);
        expect($scope.alerts.length).toBe(1);
    });

});
