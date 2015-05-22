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
        /* jshint camelcase: false */
        var recordType = {
            label: 'Accident',
            plural_label: 'Accidents',
            description: 'An Accident'
        };

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
                }
            }
        };
        /* jshint camelcase: true */

        var recordTypeUrl = /\/api\/recordtypes/;
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordType);

        var recordSchemaUrl = /\/api\/recordschemas\//;
        $httpBackend.expectPOST(recordSchemaUrl, recordSchema).respond(201);

        var recordSchemaByIdUrl = /\/api\/recordschemas\/.*\//;
        $httpBackend.expectGET(recordSchemaByIdUrl).respond(200, ResourcesMock.RecordType);

        spyOn(StateMock, 'go');

        Controller = $controller('RTRelatedAddController', {
            $scope: $scope,
            $state: StateMock
        });
        $scope.$apply();

        Controller.recordType = recordType;
        Controller.currentSchema = recordSchema;
        Controller.submitForm();

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();

        expect(StateMock.go).toHaveBeenCalled();
    });
});
