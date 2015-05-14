'use strict';

describe('ase.views.sidebar: Sidebar', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('ase.views.sidebar'));

    var $compile;
    var $httpBackend;
    var $rootScope;
    var ResourcesMock;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_,
                                _ResourcesMock_) {
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        ResourcesMock = _ResourcesMock_;
    }));

    it('should load directive', function () {
        var requestUrl = /\/api\/recordtypes\/\?active=True/;
        $httpBackend.expectGET(requestUrl).respond(200, ResourcesMock.RecordTypeResponse);

        var scope = $rootScope.$new();
        var element = $compile('<ase-sidebar></ase-sidebar>')(scope);
        $rootScope.$apply();

        // 'All Event Types' and 'Geographies' sections
        expect(element.find('.active-parent').length).toEqual(2);
    });
});
