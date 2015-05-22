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
    }));

    it('should add related content and switch view', function () {
        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var recordTypeIdUrl = new RegExp('api\/recordtypes\/' + recordTypeId);
        $httpBackend.expectGET(recordTypeIdUrl).respond(200, recordType);

        /* jshint camelcase: false */
        var recordSchema = {
            schema: {
                type: 'object',
                title: '',
                plural_title: '',
                description: '',
                properties: {},
                definitions: {
                    'Accident Details': {
                        type: 'object',
                        title: 'Accident Details',
                        plural_title: 'Accident Details',
                        description: 'Details for Accident',
                        multiple: false,
                        properties: {},
                        definitions: {}
                    }
                },
                recordType: recordType.uuid
            }
        };
        /* jshint camelcase: true */

        var recordSchemaUrl = /\/api\/recordschemas\//;
        $httpBackend.expectPOST(recordSchemaUrl, recordSchema).respond(201);

        var recordSchemaId = ResourcesMock.RecordSchema.uuid;
        var recordSchemaIdUrl = new RegExp('api\/recordschemas\/' + recordSchemaId);
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
