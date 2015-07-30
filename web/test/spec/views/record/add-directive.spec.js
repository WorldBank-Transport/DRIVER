'use strict';

describe('driver.views.record: RecordAdd', function () {

    var $compile;
    var $httpBackend;
    var $rootScope;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
    }));

    it('should load directive', function () {
        var scope = $rootScope.$new();
        var element = $compile('<driver-record></driver-record>')(scope);
        $rootScope.$apply();

        // TODO: this is a placeholder test
        expect(1).toEqual(1);
    });
});
