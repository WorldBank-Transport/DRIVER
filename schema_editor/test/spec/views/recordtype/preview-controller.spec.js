'use strict';

describe('ase.views.recordtype: RTPreviewController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.views.recordtype'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var Controller;
    var ResourcesMock;
    var recordSchemaId;
    var recordSchemaIdUrl;
    var recordType;
    var recordTypeId;
    var recordTypeIdUrl;
    var StateMock = {
        go: angular.noop
    };

    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        ResourcesMock = _ResourcesMock_;

        recordType = ResourcesMock.RecordType;
        recordTypeId = recordType.uuid;
        recordTypeIdUrl = new RegExp('api\/recordtypes\/' + recordTypeId);
        recordSchemaId = ResourcesMock.RecordSchema.uuid;
        recordSchemaIdUrl = new RegExp('api\/recordschemas\/' + recordSchemaId);
    }));

    it('should retrieve data on initialization', function () {
        $httpBackend.expectGET(recordTypeIdUrl).respond(200, recordType);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200);

        Controller = $controller('RTPreviewController', {
            $scope: $scope,
            $stateParams: { uuid: recordTypeId },
            $state: StateMock
        });

        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
