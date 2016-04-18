'use strict';

describe('driver.toddow: ToDDoW', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.toddow'));
    beforeEach(module('pascalprecht.translate'));

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
        var element = $compile('<driver-toddow chartData=""></driver-toddow>')(scope);
        $rootScope.$apply();

        expect(element.find('.day').length).toBeGreaterThan(6);
        expect(element.find('.hour').length).toBeGreaterThan(167);
    });
});
