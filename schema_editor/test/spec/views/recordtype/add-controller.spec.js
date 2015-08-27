'use strict';

describe('ase.views.recordtype: AddController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.views.recordtype'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var RecordSchemas;
    var RecordTypes;
    var Controller;
    var ResourcesMock;
    var StateMock = {
        go: angular.noop
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _ResourcesMock_, _RecordSchemas_, _RecordTypes_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        ResourcesMock = _ResourcesMock_;
        RecordSchemas = _RecordSchemas_;
        RecordTypes = _RecordTypes_;
    }));

    it('should submit record type and add a details definition', function () {
        var recordTypeUrl = /\/api\/recordtypes\//;
        var recordSchemaUrl = /\/api\/recordschemas\//;

        /* jshint camelcase: false */
        var recordType = {
            label: 'Accident',
            plural_label: 'Accidents',
            description: 'An Accident'
        };

        var recordSchema = {
            record_type: ResourcesMock.RecordType.uuid,
            schema: {
                type: 'object',
                title: '',
                plural_title: '',
                description: '',
                properties: {
                    'Accident Details': { $ref: '#/definitions/Accident Details' }
                },
                definitions: {
                    'Accident Details': {
                        type: 'object',
                        title: 'Accident Details',
                        plural_title: 'Accident Details',
                        description: 'Details for Accident',
                        multiple: false,
                        properties: {},
                        definitions: {},
                        details: true
                    }
                }
            }
        };
        /* jshint camelcase: true */

        $httpBackend.expectPOST(recordTypeUrl, recordType).respond(201, ResourcesMock.RecordType);
        $httpBackend.expectPOST(recordSchemaUrl, recordSchema)
            .respond(201, ResourcesMock.RecordTypeResponse);

        Controller = $controller('RTAddController', {
            $scope: $scope,
            $state: StateMock
        });
        $scope.$apply();

        Controller.recordType = recordType;
        Controller.submitForm();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should switch to list view after adding record type', function () {
        var recordTypeUrl = /\/api\/recordtypes\//;
        var recordSchemaUrl = /\/api\/recordschemas\//;

        $httpBackend.expectPOST(recordTypeUrl).respond(201);
        $httpBackend.expectPOST(recordSchemaUrl).respond(201);

        spyOn(StateMock, 'go');

        Controller = $controller('RTAddController', {
            $scope: $scope,
            $state: StateMock
        });
        $scope.$apply();

        Controller.submitForm();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(StateMock.go).toHaveBeenCalledWith('rt.list');
    });

});
