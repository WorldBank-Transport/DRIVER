'use strict';

describe('ase.views.usermgmt: UserEdit', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('ase.templates'));
    beforeEach(module('ase.views.usermgmt'));

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
        var requestUrl = /\/api\/users/;
        $httpBackend.expectGET(requestUrl).respond(200, ResourcesMock.UserInfoResponse);

        var scope = $rootScope.$new();
        var element = $compile('<ase-user-edit></ase-user-edit>')(scope);
        $rootScope.$apply();

        // 'Save', and 'Cancel' buttons
        expect(element.find('button').length).toEqual(2);
    });

});
