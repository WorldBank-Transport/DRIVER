'use strict';

describe('driver.resources: Aggregate Queries', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.resources'));
    beforeEach(module('driver.mock.resources'));

    var RecordAggregates;
    var $rootScope;
    var $httpBackend;
    var $q;
    var ResourcesMock;
    var RecordTypeState;

    beforeEach(inject(function (_$rootScope_, _$httpBackend_, _$q_,
                                _RecordAggregates_, _RecordTypeState_, _ResourcesMock_) {
        $q = _$q_;
        $httpBackend = _$httpBackend_;
        RecordAggregates = _RecordAggregates_;
        $rootScope = _$rootScope_;
        ResourcesMock = _ResourcesMock_;
        RecordTypeState = _RecordTypeState_;
        spyOn(RecordTypeState, 'getSelected').and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve({uuid: 'a-very-weird-uuid'});
          return deferred.promise;
        });
    }));

    it('It should use the currently selected recordtype to query for recent counts', function () {
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        var recordTypeCountUrl = /\/api\/recordtypes\/a-very-weird-uuid\/recent_counts/;

        RecordAggregates.recentCounts();

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordTypeCountUrl)
          .respond(200, {'plural': 'Birds', 'month': '10', 'quarter': 100, 'year': 1000});

        $rootScope.$apply();
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });

});
