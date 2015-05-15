'use strict';

describe('ase.views.geography: geoList', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('ase.views.geography'));

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
        var requestUrl = /\/api\/boundaries/;
        $httpBackend.expectGET(requestUrl).respond(200, ResourcesMock.GeographyResponse);

        var scope = $rootScope.$new();
        var element = $compile('<ase-geo-list></ase-geo-list>')(scope);
        $rootScope.$apply();

        // 'add new shapefile' button
        expect(element.find('button').length).toEqual(1);
    });

});
