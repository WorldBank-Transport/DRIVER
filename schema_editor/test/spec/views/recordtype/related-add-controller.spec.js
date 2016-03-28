'use strict';

describe('ase.views.recordtype: RelatedAddController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.views.recordtype'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var Controller;
    var ResourcesMock;
    var recordSchema;
    var recordSchemaId;
    var recordSchemaIdUrl;
    var recordSchemaUrl;
    var recordType;
    var recordTypeId;
    var recordTypeIdUrl;
    var StateMock = {
        go: angular.noop
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        ResourcesMock = _ResourcesMock_;

        /* jshint camelcase: false */
        recordSchema = {
            schema: {
                type: 'object',
                title: '',
                plural_title: '',
                description: '',
                properties: {},
                definitions: {
                    'Incident Details': {
                        type: 'object',
                        title: 'Incident Details',
                        plural_title: 'Incident Details',
                        description: 'Details for Incident',
                        multiple: false,
                        properties: {},
                        definitions: {}
                    }
                },
                recordType: ResourcesMock.RecordType.uuid
            }
        };
        /* jshint camelcase: true */

        recordType = ResourcesMock.RecordType;
        recordTypeId = recordType.uuid;
        recordTypeIdUrl = new RegExp('api\/recordtypes\/' + recordTypeId);
        recordSchemaId = ResourcesMock.RecordSchema.uuid;
        recordSchemaIdUrl = new RegExp('api\/recordschemas\/' + recordSchemaId);
        recordSchemaUrl = /\/api\/recordschemas\//;
    }));

    it('should add related content', function () {
        $httpBackend.expectGET(recordTypeIdUrl).respond(200, recordType);
        $httpBackend.expectPOST(recordSchemaUrl, recordSchema).respond(201);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        Controller = $controller('RTRelatedAddController', {
            $scope: $scope,
            $stateParams: { uuid: recordTypeId },
            $state: StateMock
        });

        $scope.$apply();

        Controller.recordType = recordType.uuid;
        Controller.currentSchema = recordSchema;
        Controller.submitForm();

        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should switch view', function () {
        $httpBackend.expectGET(recordTypeIdUrl).respond(200, recordType);
        $httpBackend.expectPOST(recordSchemaUrl, recordSchema).respond(201);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        spyOn(StateMock, 'go');

        Controller = $controller('RTRelatedAddController', {
            $scope: $scope,
            $stateParams: { uuid: recordTypeId },
            $state: StateMock
        });

        $scope.$apply();

        Controller.recordType = recordType.uuid;
        Controller.currentSchema = recordSchema;
        Controller.submitForm();

        $scope.$apply();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(StateMock.go).toHaveBeenCalled();
    });
});
