'use strict';

describe('driver.views.duplicates: ResolveDuplicateController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.views.duplicates'));

    var $controller;
    var $httpBackend;
    var $rootScope;
    var $scope;
    var $modal;
    var Controller;
    var ModalInstance;
    var DriverResourcesMock;
    var ResourcesMock;

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_, _$modal_,
                                _DriverResourcesMock_, _ResourcesMock_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $modal = _$modal_;
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;

        var mockConfModal = {
            result: {
                then: function(confirmCallback) {
                    return confirmCallback();
                }
            },
        };

        spyOn($modal, 'open').and.returnValue(mockConfModal);

        ModalInstance = {
            close: jasmine.createSpy('ModalInstance.close'),
            dismiss: jasmine.createSpy('ModalInstance.dismiss')
        };
        Controller = $controller('ResolveDuplicateModalController', {
            $scope: $scope,
            $modalInstance: ModalInstance,
            params: {
                duplicate: DriverResourcesMock.DuplicatesResponse.results[0],
                recordType: ResourcesMock.RecordType,
                recordSchema: ResourcesMock.RecordSchema,
                properties: {},
                propertyName: 'Incident Details'
            }
        });
        $scope.$apply();
    }));

    it('should initialize the modal controller and be able to close it', function () {
        expect(Controller.params.duplicate.record).toEqual(
            DriverResourcesMock.DuplicatesResponse.results[0].record);

        Controller.dismiss();
        expect(ModalInstance.dismiss).toHaveBeenCalled();
    });

    it('should call resolve when "keep both" is chosen', function () {
        var dupID = Controller.params.duplicate.uuid;
        var resolveDuplicateUrl = new RegExp('api/duplicates/' + dupID + '/resolve/');
        Controller.keepBoth();
        $httpBackend.expectPATCH(resolveDuplicateUrl, { uuid: dupID })
            .respond(200, { resolved: [dupID] });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
        expect(ModalInstance.close).toHaveBeenCalled();
    });

    it('should call resolve with a record ID when one is chosen', function () {
        var dupID = Controller.params.duplicate.uuid;
        var recordID = Controller.params.duplicate.record.uuid;
        var resolveDuplicateUrl = new RegExp('api/duplicates/' + dupID + '/resolve/');
        $httpBackend.expectPATCH(resolveDuplicateUrl, { uuid: dupID, recordUUID: recordID })
            .respond(200, { resolved: [dupID] });
        Controller.selectRecord(recordID);
        expect($modal.open).toHaveBeenCalled();
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
        expect(ModalInstance.close).toHaveBeenCalled();
    });
});
