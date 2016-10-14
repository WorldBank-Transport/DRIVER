'use strict';

describe('ase.views.settings: SettingsListController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.views.settings'));

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

    it('should request black spot config on controller initialization', function () {
        var requestUrl = /\/api\/blackspotconfig/;
        $httpBackend.expectGET(requestUrl).respond(200, ResourcesMock.BlackSpotConfigResponse);

        Controller = $controller('SettingsListController', {
            $scope: $scope
        });
        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(Controller.blackSpotConfig.uuid).toEqual(jasmine.any(String));
    });
});
