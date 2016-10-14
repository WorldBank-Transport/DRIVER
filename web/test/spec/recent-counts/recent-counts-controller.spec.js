'use strict';

describe('driver.recentCounts: RecentCountsController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.recentCounts'));
    beforeEach(module('pascalprecht.translate'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var Controller;
    var InitialState;
    var DriverResourcesMock;
    var ResourcesMock;

    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _InitialState_, _DriverResourcesMock_, _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;

        InitialState = _InitialState_;
        InitialState.setBoundaryInitialized();
        InitialState.setGeographyInitialized();
        InitialState.setLanguageInitialized();
    }));

    it('should make requests to recent_counts', function () {
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True&limit=all/;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(/\/api\/boundaries/).respond(DriverResourcesMock.BoundaryResponse);

        var countsUrl = new RegExp('api/records/recent_counts/\\?archived=False' +
                                   '.*record_type=' + ResourcesMock.RecordType.uuid);
        $httpBackend.expectGET(countsUrl).respond(200);
        $httpBackend.expectGET(/\/api\/boundarypolygons/)
            .respond(200, ResourcesMock.BoundaryNoGeomResponse);
        $httpBackend.expectGET(countsUrl).respond(200);

        Controller = $controller('RecentCountsController', { $scope: $scope });
        $scope.$apply();
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
