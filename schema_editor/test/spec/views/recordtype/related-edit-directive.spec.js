'use strict';

describe('ase.views.recordtype: RTRelatedEdit', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('ase.views.recordtype'));

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
        var requestUrl = /\/api\/recordtypes/;
        $httpBackend.expectGET(requestUrl).respond(200, ResourcesMock.RecordTypeResponse);

        var scope = $rootScope.$new();
        var element = $compile('<ase-rt-related-edit></ase-rt-related-edit>')(scope);
        $rootScope.$apply();

        // 'Save' and 'Cancel' buttons
        expect(element.find('button').length).toEqual(2);
    });
});
