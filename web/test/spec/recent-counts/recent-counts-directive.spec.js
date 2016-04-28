'use strict';

describe('driver.recentCounts: RecentCounts', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.resources'));
    beforeEach(module('driver.recentCounts'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var RecordAggregates;
    var $rootScope;
    var $httpBackend;
    var $q;
    var DriverResourcesMock;
    var ResourcesMock;
    var RecordState;
    var InitialState;

    beforeEach(inject(function (_$compile_, _$rootScope_, _$httpBackend_, _$q_, _InitialState_,
                                _RecordAggregates_, _DriverResourcesMock_, _ResourcesMock_,
                                _RecordState_) {
        $compile = _$compile_;
        $q = _$q_;
        $httpBackend = _$httpBackend_;
        RecordAggregates = _RecordAggregates_;
        $rootScope = _$rootScope_;
        ResourcesMock = _ResourcesMock_;
        DriverResourcesMock = _DriverResourcesMock_;
        RecordState = _RecordState_;
        spyOn(RecordState, 'getSelected').and.callFake(function() {
            var deferred = $q.defer();
            deferred.resolve({uuid: 'a-uuid', plural_label: 'cthulus'});
            return deferred.promise;
        });
        spyOn(RecordAggregates, 'recentCounts').and.callFake(function() {
            var deferred = $q.defer();
            deferred.resolve({plural: 'cthulus', year: 100, quarter: 10, month: 1});
            return deferred.promise;
        });

        InitialState = _InitialState_;
        InitialState.setBoundaryInitialized();
        InitialState.setGeographyInitialized();
        InitialState.setLanguageInitialized();
    }));

    it('It should construct the dom when given the appropriate object', function () {
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;

        RecordAggregates.recentCounts();

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(/\/api\/boundaries/).respond(DriverResourcesMock.BoundaryResponse);
        $httpBackend.expectGET(/\/api\/boundarypolygons/)
            .respond(200, ResourcesMock.BoundaryNoGeomResponse);

        var scope = $rootScope.$new();
        var element = $compile('<driver-recent-counts></driver-recent-counts>')(scope);
        $rootScope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(element.find('h2.ng-binding')[0].outerHTML)
          .toEqual('<h2 class="ng-binding">cthulus</h2>');
    });

});
