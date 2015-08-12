'use strict';

describe('driver.views.record: DetailsController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.views.record'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var Controller;
    var DriverResourcesMock;
    var ResourcesMock;

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _DriverResourcesMock_, _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should load the record', function () {
        var records = DriverResourcesMock.RecordResponse;
        var record = records.results[0];
        var recordUrl = new RegExp('api/records/' + record.uuid);
        $httpBackend.expectGET(recordUrl).respond(200, record);

        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var recordTypeIdUrl = new RegExp('api/recordtypes/' + recordTypeId);
        $httpBackend.expectGET(recordTypeIdUrl).respond(200, recordType);

        var recordSchema = ResourcesMock.RecordSchema;
        var recordSchemaId = recordSchema.uuid;
        var recordSchemaIdUrl = new RegExp('api/recordschemas/' + recordSchemaId);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        Controller = $controller('RecordDetailsController', {
            $scope: $scope,
            $stateParams: { rtuuid: recordTypeId, recorduuid: record.uuid  }
        });
        $scope.$apply();
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
