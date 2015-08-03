'use strict';

describe('driver.views.record: ListController', function () {

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

    it('should have header keys', function () {
        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var recordTypeIdUrl = new RegExp('api/recordtypes/' + recordTypeId);
        $httpBackend.expectGET(recordTypeIdUrl).respond(200, recordType);

        var recordSchema = ResourcesMock.RecordSchema;
        var recordSchemaId = recordSchema.uuid;
        var recordSchemaIdUrl = new RegExp('api/recordschemas/' + recordSchemaId);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        var recordResponse = DriverResourcesMock.RecordResponse;
        var recordsByTypeUrl = new RegExp(recordTypeId);
        $httpBackend.expectGET(recordsByTypeUrl).respond(200, recordResponse);
        /*
         TODO: can't figure out why this isn't working:
         var recordsByTypeUrl = new RegExp('api/records/?record_type=' + recordTypeId);

         Tried escaping different things, but the following error always occurs:

         Error: Unexpected request:
             GET http://localhost:7000/api/records/?record_type=15460346-65d7-4f4d-944d-27324e224691

         Expected
             GET /api/records/?record_type=15460346-65d7-4f4d-944d-27324e224691/
        */

        Controller = $controller('RecordListController', {
            $scope: $scope,
            $stateParams: { rtuuid: recordTypeId }
        });
        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(Controller.headerKeys.length).toBeGreaterThan(0);
    });
});
