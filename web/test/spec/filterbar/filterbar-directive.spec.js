'use strict';

describe('driver.filterbar: FilterbarDirective', function () {

    beforeEach(module('driver.filterbar'));
    beforeEach(module('driver.state'));
    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('pascalprecht.translate'));
    beforeEach(module('driver.weather'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var DriverResourcesMock;
    var RecordTypes;
    var ResourcesMock;
    var $state;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_, _$state_,
                                _DriverResourcesMock_, _RecordTypes_, _ResourcesMock_) {
        $state = _$state_;
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        DriverResourcesMock = _DriverResourcesMock_;
        RecordTypes = _RecordTypes_;
        ResourcesMock = _ResourcesMock_;

        spyOn($state, 'go');
    }));

    it('should load directive', function () {
        var recordTypeUrl = /\/api\/recordtypes\//;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);

        var recordSchema = ResourcesMock.RecordSchema;
        var recordSchemaId = recordSchema.uuid;
        var recordSchemaIdUrl = new RegExp('api/recordschemas/' + recordSchemaId);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        var scope = $rootScope.$new();
        var element = $compile('<driver-filterbar></driver-filterbar>')(scope);
        $rootScope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
        $rootScope.$apply();

        expect(element.find('.filterbar').length).toBeGreaterThan(0);
    });
});
