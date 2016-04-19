/**
 * Language state control - stores and retrieves a user's selected language
 */
(function () {
    'use strict';

    /* ngInject */
    function LanguageState(localStorageService, WebConfig) {
        var languageStorageName = 'language.selectedId';
        var availableLanguages = WebConfig.localization.languages;
        var selectedLanguage = null;

        var svc = {
            getAvailableLanguages: getAvailableLanguages,
            getSelected: getSelected,
            setSelected: setSelected
        };

        init();

        return svc;

        /**
         * Initialization
         */
        function init() {
            var storedLanguageId = localStorageService.get(languageStorageName);
            if (storedLanguageId) {
                selectedLanguage = _.find(availableLanguages, function(l) {
                    return l.id === storedLanguageId;
                });
            }
            selectedLanguage = selectedLanguage || availableLanguages[0];
        }

        /**
         * Store the selected language
         */
        function setSelected(language) {
            selectedLanguage = language;
            var languageId = language ? language.id : null;
            localStorageService.set(languageStorageName, languageId);
        }

        /**
         * Retrieve the selected language
         */
        function getSelected() {
            if (!selectedLanguage) {
                init();
            }
            return selectedLanguage;
        }

        /**
         * Retrieve the available languages
         */
        function getAvailableLanguages() {
            return availableLanguages;
        }
    }

    angular.module('driver.state')
    .factory('LanguageState', LanguageState);
})();
