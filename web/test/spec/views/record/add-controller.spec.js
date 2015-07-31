'use strict';

describe('driver.views.record: AddController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.views.record'));

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

    it('should fill in _localIds', function () {
        var recordType = ResourcesMock.RecordType;
        var recordTypeId = recordType.uuid;
        var recordTypeIdUrl = new RegExp('api\/recordtypes\/' + recordTypeId);
        $httpBackend.expectGET(recordTypeIdUrl).respond(200, recordType);

        var recordSchema = ResourcesMock.RecordSchema;
        var recordSchemaId = recordSchema.uuid;
        var recordSchemaIdUrl = new RegExp('api\/recordschemas\/' + recordSchemaId);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        Controller = $controller('RecordAddController', {
            $scope: $scope,
            $stateParams: { rtuuid: recordTypeId }
        });
        $scope.$apply();

        // Mock the editor so we can receive the value updates
        var editorValue = null;
        var editor = {
            setValue: function(val) {
                editorValue = val;
            }
        };
        var testUuid = '4cde1cc9-2cd2-487b-983d-ae1de1d6198c';
        var uuidR = '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$';

        // Send the updated data
        Controller.onDataChange({
            Details: {
                'abc': '123',
                _localId: ''
            },
            Person: [{
                'abc': '123',
                _localId: testUuid
            }]
        }, [], editor);

        // Empty _localId fields should be filled in with uuids
        expect(editorValue).toEqual(jasmine.any(Object));
        expect(editorValue.Details._localId).toMatch(uuidR);
        expect(editorValue.Person[0]._localId).toEqual(testUuid);

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
