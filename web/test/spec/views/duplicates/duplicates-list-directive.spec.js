'use strict';

describe('driver.views.duplicates: Duplicates List Directive', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.views.duplicates'));
    beforeEach(module('driver.views.record'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var DriverResourcesMock;
    var ResourcesMock;
    var InitialState;

    var Element;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_,
                                _DriverResourcesMock_, _ResourcesMock_, _InitialState_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
        InitialState = _InitialState_;

        InitialState.setRecordTypeInitialized();
        InitialState.setBoundaryInitialized();
        InitialState.setGeographyInitialized();
        InitialState.setLanguageInitialized();

        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;

        var recordSchema = ResourcesMock.RecordSchema;
        var recordSchemaId = recordSchema.uuid;
        var recordSchemaIdUrl = new RegExp('api/recordschemas/' + recordSchemaId);

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        $scope = $rootScope.$new();
        Element = $compile('<driver-duplicates-list></driver-duplicates-list>')($scope);
        $rootScope.$apply();

        var duplicatesOffsetUrl = /api\/duplicates\//;
        $httpBackend.expectGET(duplicatesOffsetUrl).respond(200, DriverResourcesMock.DuplicatesResponse);
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    }));

    it('should load directive', function () {
        expect(Element.find('.duplicates-title').length).toBe(1);
        expect(Element.find('tbody tr').length).toBe(1);
    });
});
