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

    it('should correctly delete related content types', function() {
        $httpBackend.whenGET(new RegExp('api\/recordtypes\/*')).respond(
            200, {'current_schema': 'irrelevant'}
        );
        $httpBackend.whenGET(new RegExp('api\/recordschemas\/*')).respond(
            200,
            {
                'schema': {
                    'definitions': {
                        'keyToDelete': 'should be gone',
                        'keyToRemain': 'should remain'
                    },
                    'properties': {
                        'keyToDelete': 'should be gone',
                        'keyToRemain': 'should remain'
                    }
                }
            }
        );
        Controller = $controller('RTRelatedController', {
            $scope: $scope, $stateParams: { uuid: 'irrelevant' }
        });

        $scope.$apply();
        $httpBackend.flush();

        Controller.deleteSchema('keyToDelete');
        expect(Controller.currentSchema.schema.definitions.keyToDelete).not.toBeDefined();
        expect(Controller.currentSchema.schema.properties.keyToDelete).not.toBeDefined();
        expect(Controller.currentSchema.schema.definitions.keyToRemain).toBeDefined();
        expect(Controller.currentSchema.schema.properties.keyToRemain).toBeDefined();
    });
});
