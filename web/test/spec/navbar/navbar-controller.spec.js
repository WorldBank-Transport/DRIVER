'use strict';

describe('driver.navbar: NavbarController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.navbar'));
    beforeEach(module('driver.views.home'));
    beforeEach(module('driver.views.account'));
    beforeEach(module('driver.views.dashboard'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var $state;
    var $stateParams;
    var Controller;
    var DriverResourcesMock;
    var ResourcesMock;

    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_, _$state_, _$stateParams_,
                                _DriverResourcesMock_, _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $state = _$state_;
        $stateParams = _$stateParams_;
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;

        spyOn($state, 'go');
    }));

    it('should have record types, polygons, and available states', function () {
        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var geographiesUrl = /\/api\/boundaries/;
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        var polygonUrl = /\/api\/boundarypolygons\/\?active=True/;

        $httpBackend.expectGET(geographiesUrl).respond(200, ResourcesMock.GeographyResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(polygonUrl).respond(200, DriverResourcesMock.PolygonResponse);

        Controller = $controller('NavbarController', {
            $scope: $scope,
            $stateParams: { rtuuid: recordTypeId }
        });
        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(Controller.recordTypeResults.length).toBeGreaterThan(0);
        expect(Controller.geographyResults.length).toBeGreaterThan(0);
        expect(Controller.polygonResults.length).toBeGreaterThan(0);
    });

    it('should not have current state as an option', function () {
        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var geographiesUrl = /\/api\/boundaries/;
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        var polygonUrl = /\/api\/boundarypolygons\/\?active=True/;

        $httpBackend.expectGET(geographiesUrl).respond(200, ResourcesMock.GeographyResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(polygonUrl).respond(200, DriverResourcesMock.PolygonResponse);

        $state.current = $state.get('home');

        Controller = $controller('NavbarController', {
            $scope: $scope,
            $stateParams: { rtuuid: recordTypeId }
        });
        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        var matches = _.filter(Controller.availableStates, function(state) {
            return state.name === 'home';
        });
        expect(Controller.availableStates.length).toBeGreaterThan(0);
        expect(matches.length).toBe(0);
    });

    it('should correctly navigate to state', function () {
        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var geographiesUrl = /\/api\/boundaries/;
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        var polygonUrl = /\/api\/boundarypolygons\/\?active=True/;

        $httpBackend.expectGET(geographiesUrl).respond(200, ResourcesMock.GeographyResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(polygonUrl).respond(200, DriverResourcesMock.PolygonResponse);

        Controller = $controller('NavbarController', {
            $scope: $scope,
        });

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        Controller.navigateToStateName('account');
        expect($state.go).toHaveBeenCalledWith('account', jasmine.any(Object));

        Controller.onStateSelected($state.get('dashboard'));
        expect($state.go).toHaveBeenCalledWith('dashboard', jasmine.any(Object));
    });
});
