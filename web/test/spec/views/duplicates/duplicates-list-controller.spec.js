'use strict';

describe('driver.views.duplicates: DuplicatesListController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.views.duplicates'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var Controller;
    var ModalController;
    var DriverResourcesMock;
    var ResourcesMock;
    var InitialState;

    // Initialize the controller and a mock scope
    beforeEach(function () {
        inject(function (_$controller_, _$httpBackend_, _$rootScope_,
                                _DriverResourcesMock_, _ResourcesMock_, _InitialState_) {
            $controller = _$controller_;
            $httpBackend = _$httpBackend_;
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            DriverResourcesMock = _DriverResourcesMock_;
            ResourcesMock = _ResourcesMock_;
            InitialState = _InitialState_;

            InitialState.setRecordTypeInitialized();
            InitialState.setBoundaryInitialized();
            InitialState.setGeographyInitialized();

            var recordTypeUrl = /\/api\/recordtypes\/\?active=True/;

            var recordSchema = ResourcesMock.RecordSchema;
            var recordSchemaId = recordSchema.uuid;
            var recordSchemaIdUrl = new RegExp('api/recordschemas/' + recordSchemaId);

            var recordType = ResourcesMock.RecordType;
            var recordTypeId = recordType.uuid;

            $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
            $httpBackend.expectGET(recordTypeUrl).respond(200, ResourcesMock.RecordTypeResponse);
            $httpBackend.expectGET(recordSchemaIdUrl).respond(200, recordSchema);

            Controller = $controller('DuplicatesListController', {
                $scope: $scope,
            });

            var duplicatesOffsetUrl = /api\/duplicates\//;
            $httpBackend.expectGET(duplicatesOffsetUrl).respond(200, DriverResourcesMock.DuplicatesResponse);
            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    it('should have header keys', function () {
        expect(Controller.headerKeys.length).toBeGreaterThan(0);
    });

    it('should make offset requests for pagination', function () {
        var duplicatesOffsetUrl = new RegExp('api/duplicates/\\?.*limit=50.*');
        Controller.getNextDuplicates();
        duplicatesOffsetUrl = duplicatesOffsetUrl = new RegExp('api/duplicates/\\?.*limit=50.*offset=50.*');
        $httpBackend.expectGET(duplicatesOffsetUrl).respond(200, DriverResourcesMock.DuplicatesResponse);
        $httpBackend.flush();

        Controller.getPreviousDuplicates();
        duplicatesOffsetUrl = new RegExp('api/duplicates/\\?.*limit=50.*');
        $httpBackend.expectGET(duplicatesOffsetUrl).respond(200, DriverResourcesMock.DuplicatesResponse);
        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('driver.views.duplicates: ResolveDuplicateModalController', function () {
        var ModalInstance;

        beforeEach(function () {
            ModalInstance = {
                close: jasmine.createSpy('ModalInstance.close')
            };
            ModalController = $controller('ResolveDuplicateModalController', {
                $scope: $scope,
                $modalInstance: ModalInstance,
                params: {
                    duplicate: DriverResourcesMock.DuplicatesResponse.results[0],
                    duplicatesList: DriverResourcesMock.DuplicatesResponse.results,
                    recordType: Controller.recordType,
                    recordSchema: Controller.recordSchema,
                    properties: Controller.headerKeys,
                    propertyName: Controller.detailsProperty
                }
            });
            $scope.$apply();

            ModalController.params.duplicate.resolved = false;
        });

        it('should initialize the modal controller and be able to close it', function () {
            expect(ModalController.params.duplicate.record).toEqual(
                DriverResourcesMock.DuplicatesResponse.results[0].record);

            ModalController.close();
            expect(ModalInstance.close).toHaveBeenCalled();
            expect(ModalController.params.duplicate.resolved).toBe(false);
        });

        it('should call resolve when "keep both" is chosen', function () {
            var dupID = ModalController.params.duplicate.uuid;
            var resolveDuplicateUrl = new RegExp('api/duplicates/' + dupID + '/resolve/');
            ModalController.keepBoth();
            $httpBackend.expectPATCH(resolveDuplicateUrl, { uuid: dupID })
                .respond(200, { resolved: [dupID] });
            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingRequest();
            expect(ModalController.params.duplicate.resolved).toBe(true);
            expect(ModalInstance.close).toHaveBeenCalled();
        });

        it('should call resolve with a record ID when one is chosen', function () {
            var dupID = ModalController.params.duplicate.uuid;
            var recordID = ModalController.params.duplicate.record.uuid;
            var resolveDuplicateUrl = new RegExp('api/duplicates/' + dupID + '/resolve/');
            ModalController.selectRecord(recordID);
            $httpBackend.expectPATCH(resolveDuplicateUrl, { uuid: dupID, recordUUID: recordID })
                .respond(200, { resolved: [dupID] });
            $httpBackend.flush();
            $httpBackend.verifyNoOutstandingRequest();
            expect(ModalController.params.duplicate.resolved).toBe(true);
            expect(ModalInstance.close).toHaveBeenCalled();
        });
    });
});
