'use strict';

describe('driver.navbar: NavbarController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.navbar'));
    beforeEach(module('driver.views.account'));
    beforeEach(module('driver.views.dashboard'));
    beforeEach(module('driver.views.home'));
    beforeEach(module('driver.views.map'));
    beforeEach(module('driver.views.record'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var $state;
    var Controller;
    var DriverResourcesMock;
    var ResourcesMock;

    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_, _$state_,
                                _DriverResourcesMock_, _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $state = _$state_;
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should have record types, polygons, and available states', function () {
        var geographiesUrl = /\/api\/boundaries/;
        $httpBackend.expectGET(geographiesUrl).respond(200, ResourcesMock.GeographyResponse);

        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);

        var geographyId = ResourcesMock.GeographyResponse.results[0].uuid;
        var polygonsUrl = new RegExp('api/boundarypolygons/\\?boundary=' + geographyId);
        $httpBackend.expectGET(polygonsUrl).respond(200, DriverResourcesMock.PolygonResponse);

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
        expect(Controller.availableStates.length).toBeGreaterThan(0);
    });

    it('should not have current state as an option', function () {
        var geographiesUrl = /\/api\/boundaries/;
        $httpBackend.expectGET(geographiesUrl).respond(200, ResourcesMock.GeographyResponse);

        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);

        var geographyId = ResourcesMock.GeographyResponse.results[0].uuid;
        var polygonsUrl = new RegExp('api/boundarypolygons/\\?boundary=' + geographyId);
        $httpBackend.expectGET(polygonsUrl).respond(200, DriverResourcesMock.PolygonResponse);

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
        expect(matches.length).toBe(0);
    });

    it('should correctly navigate to state', function () {
        var geographiesUrl = /\/api\/boundaries/;
        $httpBackend.expectGET(geographiesUrl).respond(200, ResourcesMock.GeographyResponse);

        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);

        var geographyId = ResourcesMock.GeographyResponse.results[0].uuid;
        var polygonsUrl = new RegExp('api/boundarypolygons/\\?boundary=' + geographyId);
        $httpBackend.expectGET(polygonsUrl).respond(200, DriverResourcesMock.PolygonResponse);

        $state.current = $state.get('home');

        Controller = $controller('NavbarController', {
            $scope: $scope,
            $stateParams: { rtuuid: recordTypeId }
        });
        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        Controller.navigateToStateName('account');
        $scope.$apply();
        expect($state.current.name).toBe('account');

        Controller.onStateSelected($state.get('dashboard'));
        $scope.$apply();
        expect($state.current.name).toBe('dashboard');
    });
});
