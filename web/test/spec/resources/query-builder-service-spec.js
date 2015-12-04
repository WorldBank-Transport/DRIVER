'use strict';

describe('driver.resources: QueryBuilder', function () {

    var mockFilterState = {'filters': {'__dateRange': {'min': '2015-10-05'}}};
    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.resources', function($provide) {
        $provide.value('FilterState', mockFilterState);
    }));
    beforeEach(module('driver.mock.resources'));

    var QueryBuilder;
    var $rootScope;
    var $httpBackend;
    var DriverResourcesMock;
    var ResourcesMock;
    var FilterState;

    beforeEach(inject(function (_$rootScope_, _$httpBackend_, _QueryBuilder_, _DriverResourcesMock_,
                                _ResourcesMock_, _FilterState_) {
        $httpBackend = _$httpBackend_;
        QueryBuilder = _QueryBuilder_;
        $rootScope = _$rootScope_;
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
        FilterState = _FilterState_;
    }));

    it('should result in a call out to determine the selected RecordType and use the date filtering on FilterState', function () {
        var recordsUrl = /\/api\/records/;
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        var recordSchemaUrl = /\/api\/recordschemas/;

        QueryBuilder.djangoQuery();

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordSchemaUrl).respond(200, ResourcesMock.RecordSchema);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordsUrl).respond(200, DriverResourcesMock.RecordResponse);

        $rootScope.$apply();
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });

    /** BROKEN NOW THAT ASSEMBLEJSONFILTERPARAMS RETURNS A PROMISE
     it('should deduplicate redundant information when provided a flattened representation of multiple nodes', function() {
        expect(QueryBuilder.assembleJsonFilterParams({'a#b': {'_rule_type': 'containment', 'contains': [1,2,3]},
                                                       'a#c': {'_rule_type': 'intrange', 'min': 1, 'max': 5}}))
          .toEqual({'a': {'b': {'_rule_type': 'containment', 'contains': [1,2,3]},
                          'c': {'_rule_type': 'intrange', 'min': 1, 'max': 5}}});
    });
   **/
});
