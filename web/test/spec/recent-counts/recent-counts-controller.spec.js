'use strict';

describe('driver.recentCounts: RecentCountsController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.recentCounts'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var Controller;
    var ResourcesMock;

    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_, _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        ResourcesMock = _ResourcesMock_;
    }));

    it('should make requests to recent_counts', function () {
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True&limit=all/;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);

        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var countsUrl = new RegExp('api/recordtypes/' + recordTypeId +
                                   '/recent_counts/\\?limit=all');
        $httpBackend.expectGET(countsUrl).respond(200);
        $httpBackend.expectGET(countsUrl).respond(200);
        $httpBackend.expectGET(countsUrl).respond(200);

        Controller = $controller('RecentCountsController', { $scope: $scope });
        $scope.$apply();
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
