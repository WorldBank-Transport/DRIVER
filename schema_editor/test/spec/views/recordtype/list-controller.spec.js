'use strict';

describe('ase.views.recordtype: ListController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.views.recordtype'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var RecordTypes;
    var Controller;
    var ResourcesMock;

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _ResourcesMock_, _RecordTypes_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        ResourcesMock = _ResourcesMock_;
        RecordTypes = _RecordTypes_;
    }));

    it('should make an httprequest for active recordtypes on controller initialize', function () {
        var requestUrl = /\/api\/recordtypes\/\?active=True/;
        $httpBackend.expectGET(requestUrl).respond(200, ResourcesMock.RecordTypeResponse);

        Controller = $controller('RTListController', {
            $scope: $scope
        });
        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
