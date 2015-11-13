'use strict';

describe('driver.views.record: RecordDetailsModalController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.views.record'));

    var $controller;
    var $rootScope;
    var $scope;
    var Controller;
    var DriverResourcesMock;
    var ResourcesMock;
    var ModalInstance;

    beforeEach(inject(function (_$controller_, _$rootScope_,
                                _DriverResourcesMock_, _ResourcesMock_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        DriverResourcesMock = _DriverResourcesMock_;
        ResourcesMock = _ResourcesMock_;
        ModalInstance = {
            close: jasmine.createSpy('ModalInstance.close')
        };
    }));

    it('should initialize the modal controller and be able to close it', function () {
        Controller = $controller('RecordDetailsModalController', {
            $scope: $scope,
            $modalInstance: ModalInstance,
            record: DriverResourcesMock.RecordResponse,
            recordType: ResourcesMock.RecordTypeResponse,
            recordSchema: ResourcesMock.RecordSchema
        });
        $scope.$apply();

        expect(Controller.record).toEqual(DriverResourcesMock.RecordResponse);
        expect(Controller.recordType).toEqual(ResourcesMock.RecordTypeResponse);
        expect(Controller.recordSchema).toEqual(ResourcesMock.RecordSchema);

        Controller.close();
        expect(ModalInstance.close).toHaveBeenCalled();
    });
});
