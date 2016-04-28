'use strict';

describe('driver.views.record: DetailsController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.views.record'));
    beforeEach(module('pascalprecht.translate'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var $stateParams;
    var Controller;
    var DriverResourcesMock;
    var ResourcesMock;

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_, _$stateParams_,
                                _DriverResourcesMock_, _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $stateParams = _$stateParams_;
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should load the record', function () {
        var recordId = DriverResourcesMock.RecordResponse.results[0].uuid;
        $stateParams.recorduuid = recordId;
        var recordSchema = ResourcesMock.RecordSchema;

        var allRecordTypesUrl = new RegExp('api/recordtypes/');
        var recordTypeUrl = new RegExp('api/recordtypes/.*record=' + recordId);
        var recordUrl = new RegExp('api/records/' + recordId);
        var recordSchemaIdUrl = new RegExp('api/recordschemas/' + recordSchema.uuid);

        $httpBackend.expectGET(allRecordTypesUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordUrl).respond(200, DriverResourcesMock.RecordResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        Controller = $controller('RecordDetailsController', {
            $scope: $scope
        });
        $scope.$apply();
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
