'use strict';

describe('driver.views.record: AddEditController', function () {

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

    it('should fill in _localIds', function () {
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        var recordUrl = /\/api\/records/;

        var recordSchema = ResourcesMock.RecordSchema;
        var recordSchemaId = recordSchema.uuid;
        var recordSchemaIdUrl = new RegExp('api/recordschemas/' + recordSchemaId);

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordUrl).respond(200, DriverResourcesMock.RecordResponse.results[0]);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        Controller = $controller('RecordAddEditController', {
            $scope: $scope,
            $stateParams: { recorduuid: DriverResourcesMock.RecordResponse.results[0].uuid }
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

    it('should allow editing a record', function () {
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        var recordUrl = /\/api\/records/;

        var recordSchema = ResourcesMock.RecordSchema;
        var recordSchemaId = recordSchema.uuid;
        var recordSchemaIdUrl = new RegExp('api/recordschemas/' + recordSchemaId);

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordUrl).respond(200, DriverResourcesMock.RecordResponse.results[0]);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        Controller = $controller('RecordAddEditController', {
            $scope: $scope,
            $stateParams: { recorduuid: DriverResourcesMock.RecordResponse.results[0].uuid }
        });
        $scope.$apply();
        $httpBackend.flush();

        // Should submit a PATCH request to record endpoint
        var recordEndpoint = new RegExp('api/records/');
        $httpBackend.expectPATCH(recordEndpoint).respond(200);
        Controller.onSaveClicked();
        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should allow adding a new record', function () {
        var records = DriverResourcesMock.RecordResponse;
        var record = records.results[0];

        // set coordinate as happens for a new record
        $scope.geom = {
            lat: record.geom.coordinates[0],
            lng: record.geom.coordinates[1]
        };
        delete record.geom;
        delete record.occurred_to;
        var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;
        var recordUrl = /\/api\/records/;

        var recordSchema = ResourcesMock.RecordSchema;
        var recordSchemaId = recordSchema.uuid;
        var recordSchemaIdUrl = new RegExp('api/recordschemas/' + recordSchemaId);

        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
        $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

        Controller = $controller('RecordAddEditController', {
            $scope: $scope
        });
        $scope.$apply();
        $httpBackend.flush();

        // Should submit a PUT request to record endpoint
        var recordEndpoint = new RegExp('api/records/');
        $httpBackend.expectPUT(recordEndpoint).respond(200);
        Controller.onSaveClicked();

        $httpBackend.verifyNoOutstandingRequest();
    });
});
