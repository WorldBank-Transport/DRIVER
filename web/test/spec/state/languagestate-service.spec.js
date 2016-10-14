'use strict';

describe('driver.state: LanguageState', function () {

    beforeEach(module('ase.mock.resources'));
    beforeEach(module('driver.state'));
    beforeEach(module('pascalprecht.translate'));

    var $rootScope;
    var LanguageState;
    var LocalStorageService;

    beforeEach(inject(function (_$rootScope_, _LanguageState_, _localStorageService_) {
        $rootScope = _$rootScope_;
        LanguageState = _LanguageState_;
        LocalStorageService = _localStorageService_;
    }));

    it('should have a local storage provider', function () {
        expect(LocalStorageService).toBeDefined();
    });

    it('should return a default language selection when none is set', function () {
        LanguageState.setSelected(null);
        expect(LocalStorageService.get('language.selectedId')).toBeNull();
        expect(LanguageState.getSelected()).toEqual(LanguageState.getAvailableLanguages()[0]);
    });

    it('should set, get, and store language selection', function () {
        LanguageState.setSelected(LanguageState.getAvailableLanguages()[0]);
        expect(LanguageState.getSelected().id).toEqual('en-us');
        expect(LocalStorageService.get('language.selectedId')).toEqual('en-us');
    });
});
