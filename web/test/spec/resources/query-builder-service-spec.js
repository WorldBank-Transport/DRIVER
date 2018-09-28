'use strict';

describe('driver.resources: QueryBuilder', function () {

    var mockFilterState = {
        'filters': {
            '__dateRange': {
                'min': '2015-10-05'
            }
        },
        'getDateFilter': function(){
            return {minDate:'2015-10-04T16:00:00.000Z'};
        },
        'getQualityChecksFilter': function () {
            return [];
        },
        'getNonJsonFilterNames': function () {
            return ['__dateRange'];
        },
        'getCreatedFilter': function(){
            return {};
        },
        'getCreatedByFilter': function(){
            return '';
        },
        'getWeatherFilter': function(){
            return '';
        }
    };
    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.resources', function($provide) {
        $provide.value('FilterState', mockFilterState);
    }));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('pascalprecht.translate'));

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
        // 2015-10-05 is 2015-10-04T16:00:00.000Z in local Manila time
        var recordsUrl = /\/api\/records\/\?archived=False&details_only=True&limit=50&occurred_min=2015-10-04T16:00:00.000Z&record_type=15460346-65d7-4f4d-944d-27324e224691/;
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        var recordSchemaUrl = /\/api\/recordschemas/;
        var boundariesUrl = /api\/boundaries/;
        var boundaryPolygonsUrl = /api\/boundarypolygons/;

        QueryBuilder.djangoQuery();

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(boundariesUrl).respond(200, ResourcesMock.GeographyResponse);
        $httpBackend.expectGET(recordSchemaUrl).respond(200, ResourcesMock.RecordSchema);
        $httpBackend.expectGET(boundaryPolygonsUrl).respond(200, ResourcesMock.BoundaryNoGeomResponse);
        $httpBackend.expectGET(recordsUrl).respond(200, DriverResourcesMock.RecordResponse);

        $rootScope.$apply();
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
