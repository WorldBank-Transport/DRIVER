'use strict';

describe('driver.views.record: RecordDetails', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.views.record'));
    beforeEach(module('driver.templates'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var RecordTypes;
    var DriverResourcesMock;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_,
                                _DriverResourcesMock_, _RecordTypes_, _ResourcesMock_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        DriverResourcesMock = _DriverResourcesMock_;
        RecordTypes = _RecordTypes_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should load directive', function () {
        var recordUrl = /\/api\/records/;
        $httpBackend.expectGET(recordUrl).respond(200, DriverResourcesMock.RecordResponse);

        var recordTypeUrl = /\/api\/recordtypes/;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordType);

        var recordSchemaUrl = /\/api\/recordschemas/;
        $httpBackend.expectGET(recordSchemaUrl).respond(200, ResourcesMock.RecordSchema);

        var scope = $rootScope.$new();
        var element = $compile('<driver-record-details></driver-record-details>')(scope);
        $rootScope.$apply();

        expect(element.find('.form-area-heading').length).toEqual(1);

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
