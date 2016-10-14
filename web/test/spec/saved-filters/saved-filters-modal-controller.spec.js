'use strict';

describe('driver.savedFilters: SavedFiltersModalController', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('driver.savedFilters'));
    beforeEach(module('pascalprecht.translate'));

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
        Controller = $controller('SavedFiltersModalController', {
            $scope: $scope,
            $modalInstance: ModalInstance
        });
        $scope.$apply();

        Controller.closeModal();
        expect(ModalInstance.close).toHaveBeenCalled();
    });
});
