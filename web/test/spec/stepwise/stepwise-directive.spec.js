'use strict';

describe('driver.stepwise: Stepwise graph directive', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.resources'));
    beforeEach(module('driver.stepwise'));
    beforeEach(module('driver.elemstat'));

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
        var element = $compile('<div element-stats><driver-stepwise chartData=""></driver-stepwise></div>')(scope);
        $rootScope.$apply();

        expect(element.find('g.outer').length).toBe(1);
    });
});
