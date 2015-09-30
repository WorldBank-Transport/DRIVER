'use strict';

describe('driver.resources: QueryBuilder', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.resources'));
    beforeEach(module('driver.mock.resources'));

    var QueryBuilder;
    var $rootScope;
    var $httpBackend;
    var DriverResourcesMock;
    var ResourcesMock;

    beforeEach(inject(function (_$rootScope_, _$httpBackend_,
                                _QueryBuilder_, _DriverResourcesMock_, _ResourcesMock_) {
        $httpBackend = _$httpBackend_;
        QueryBuilder = _QueryBuilder_;
        $rootScope = _$rootScope_;
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should result in a call out to determine the selected RecordType', function () {
        var recordsUrl = /\/api\/records\/\?record_type=15460346-65d7-4f4d-944d-27324e224691/;
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;

        QueryBuilder.djangoQuery();

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordsUrl).respond(200, DriverResourcesMock.RecordResponse);

        $rootScope.$apply();
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
