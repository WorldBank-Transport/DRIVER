'use strict';

describe('driver.details: DetailsTabsController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.details'));
    beforeEach(module('pascalprecht.translate'));

    var $compile;
    var $httpBackend;
    var $q;
    var $rootScope;
    var DriverResourcesMock;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$q_, _$rootScope_,
                                _DriverResourcesMock_, _ResourcesMock_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should pass this placeholder test', function () {
        var scope = $rootScope.$new();
        scope.record = DriverResourcesMock.RecordResponse.results[0];
        scope.recordSchema = ResourcesMock.RecordSchemaResponse.results[0];

        var recordUrl = /api\/records\//;
        $httpBackend.expectGET(recordUrl).respond(200, DriverResourcesMock.RecordResponse.results[0]);

        var element = $compile('<driver-details-tabs ' +
                               'record-schema="recordSchema" record="record" user-can-write="true">' +
                               '</driver-details-tabs>')(scope);
        $rootScope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        var controller = element.controller('driverDetailsTabs');
        expect(controller).toBeDefined();
    });
});
