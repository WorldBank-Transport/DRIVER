'use strict';

describe('driver.views.record: RecordAddEdit', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.views.record'));
    beforeEach(module('ase.templates'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var RecordTypes;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_,
                                _RecordTypes_, _ResourcesMock_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        RecordTypes = _RecordTypes_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should load directive', function () {
        var recordTypeUrl = /\/api\/recordtypes/;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordType);

        var recordSchemaUrl = /\/api\/recordschemas/;
        $httpBackend.expectGET(recordSchemaUrl).respond(200, ResourcesMock.RecordSchema);

        var scope = $rootScope.$new();
        var element = $compile('<driver-record-add-edit></driver-record-add-edit>')(scope);
        $rootScope.$apply();

        expect(element.find('json-editor').length).toEqual(1);

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
