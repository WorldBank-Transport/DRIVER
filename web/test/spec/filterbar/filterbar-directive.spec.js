'use strict';

describe('driver.filterbar: Filterbar', function () {

    beforeEach(module('driver.filterbar'));
    beforeEach(module('driver.state'));
    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.mock.resources'));
    beforeEach(module('ase.templates'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var DriverResourcesMock;
    var RecordTypes;
    var ResourcesMock;
    var $state;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_, _$state_,
                                _DriverResourcesMock_, _RecordTypes_, _ResourcesMock_) {
        $state = _$state_;
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        DriverResourcesMock = _DriverResourcesMock_;
        RecordTypes = _RecordTypes_;
        ResourcesMock = _ResourcesMock_;

        spyOn($state, 'go');
    }));

    it('should load directive', function () {
        var scope = $rootScope.$new();
        var element = $compile('<driver-filterbar></driver-filterbar>')(scope);
        $rootScope.$apply();

        $httpBackend.verifyNoOutstandingRequest();
        $rootScope.$apply();

        expect(element.find('.navbar').length).toBeGreaterThan(0);
    });
});
