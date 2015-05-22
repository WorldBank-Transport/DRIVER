'use strict';

describe('ase.views.recordtype: RelatedController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.views.recordtype'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var Controller;
    var ResourcesMock;

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        ResourcesMock = _ResourcesMock_;
    }));

    it('should request proper record type and record schema', function () {
        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var recordTypeIdUrl = new RegExp('api\/recordtypes\/' + recordTypeId);
        $httpBackend.expectGET(recordTypeIdUrl).respond(200, recordType);

        var recordSchema = ResourcesMock.RecordSchema;
        var recordSchemaId = recordSchema.uuid;
        var recordSchemaIdUrl = new RegExp('api\/recordschemas\/' + recordSchemaId);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        Controller = $controller('RTRelatedController', {
            $scope: $scope,
            $stateParams: { uuid: recordTypeId }
        });

        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
