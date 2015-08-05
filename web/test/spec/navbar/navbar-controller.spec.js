'use strict';

describe('driver.navbar: NavbarController', function () {

    beforeEach(module('ase.mock.resources'));
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
    var ResourcesMock;

    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_, _$state_,
                                _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $state = _$state_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should have record types and available states', function () {
        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);

        Controller = $controller('NavbarController', {
            $scope: $scope,
            $stateParams: { rtuuid: recordTypeId }
        });
        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(Controller.recordTypes.length).toBeGreaterThan(0);
        expect(Controller.availableStates.length).toBeGreaterThan(0);
    });

    it('should not have current state as an option', function () {
        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);

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
});
