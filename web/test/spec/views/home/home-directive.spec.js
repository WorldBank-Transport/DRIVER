'use strict';

describe('driver.views.home: Home', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('driver.views.home'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var RecordTypes;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_,
                                _RecordTypes_, _ResourcesMock_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        RecordTypes = _RecordTypes_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should load directive', function () {
        var scope = $rootScope.$new();
        var element = $compile('<driver-home></driver-home>')(scope);
        $rootScope.$apply();

        // placeholder test
        expect(element.find('.form-area-heading').length).toEqual(1);
    });
});
