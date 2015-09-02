'use strict';

describe('driver.views.record: RecordList', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.views.record'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var RecordTypes;
    var DriverResourcesMock;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_, _RecordTypes_,
                                _DriverResourcesMock_, _ResourcesMock_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        RecordTypes = _RecordTypes_;
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should load directive', function () {
        var recordTypeUrl = /\/api\/recordtypes/;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordType);

        var recordSchemaUrl = /\/api\/recordschemas/;
        $httpBackend.expectGET(recordSchemaUrl).respond(200, ResourcesMock.RecordSchema);

        var recordsUrl = /\/api\/records/;
        $httpBackend.expectGET(recordsUrl).respond(200, DriverResourcesMock.RecordResponse);

        var scope = $rootScope.$new();
        var element = $compile('<driver-record-list></driver-record-list>')(scope);
        $rootScope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(element.find('.date').length).toBeGreaterThan(0);
        expect(element.find('.detail').length).toBeGreaterThan(0);
        expect(element.find('.links').length).toBeGreaterThan(0);
    });
});
