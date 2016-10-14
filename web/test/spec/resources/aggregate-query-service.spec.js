'use strict';

describe('driver.resources: Aggregate Queries', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('pascalprecht.translate'));

    var RecordAggregates;
    var $rootScope;
    var $httpBackend;
    var $q;
    var ResourcesMock;
    var RecordState;

    beforeEach(inject(function (_$rootScope_, _$httpBackend_, _$q_,
                                _RecordAggregates_, _RecordState_, _ResourcesMock_) {
        $q = _$q_;
        $httpBackend = _$httpBackend_;
        RecordAggregates = _RecordAggregates_;
        $rootScope = _$rootScope_;
        ResourcesMock = _ResourcesMock_;
        RecordState = _RecordState_;
        spyOn(RecordState, 'getSelected').and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve({uuid: 'a-very-weird-uuid'});
          return deferred.promise;
        });
    }));

    it('It should use the currently selected recordtype to query for recent counts', function () {
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        var boundariesUrl = /api\/boundaries/;
        var boundaryPolygonsUrl = /api\/boundarypolygons/;
        var recordTypeCountUrl = new RegExp('api/records/recent_counts/' +
                                            '\\?archived=False.*record_type=a-very-weird-uuid');

        RecordAggregates.recentCounts();

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(boundariesUrl).respond(200, ResourcesMock.GeographyResponse);
        $httpBackend.expectGET(recordTypeCountUrl)
          .respond(200, {'plural': 'Birds', 'month': '10', 'quarter': 100, 'year': 1000});
        $httpBackend.expectGET(boundaryPolygonsUrl).respond(200, ResourcesMock.BoundaryNoGeomResponse);

        $rootScope.$apply();
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });

});
