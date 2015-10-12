'use strict';

describe('driver:map-layers TileUrlService', function () {
    beforeEach(module('driver.map-layers'));

    var TileUrlService;
    var $rootScope;

    beforeEach(inject(function (_$rootScope_, _TileUrlService_) {
        TileUrlService = _TileUrlService_;
        $rootScope = _$rootScope_;
    }));

    it('should provide URLs to access PNG tiles of all records', function () {
        TileUrlService.allRecTilesUrl().then(function(url) {
            expect(url).toEqual(jasmine.stringMatching(/\.png/));
        });
        $rootScope.$apply();
    });

    it('should provide URLs to access UTF Grid tiles of all records', function () {
        TileUrlService.allRecUtfGridTilesUrl().then(function(url) {
            expect(url).toEqual(jasmine.stringMatching((/\.grid\.json/)));
        });
        $rootScope.$apply();
    });

    it('should provide URLs to access PNG tiles per record type', function () {
        TileUrlService.recTilesUrl('notarealuuid').then(function(url) {
            expect(url).toEqual(jasmine.stringMatching(/\.png/));
            expect(url).toEqual(jasmine.stringMatching(/notarealuuid/));
        });
        $rootScope.$apply();
    });

    it('should provide URLs to access UTF Grid tiles per record type', function () {
        TileUrlService.recUtfGridTilesUrl('notarealuuid').then(function(url) {
            expect(url).toEqual(jasmine.stringMatching(/\.grid\.json/));
            expect(url).toEqual(jasmine.stringMatching(/notarealuuid/));
        });
        $rootScope.$apply();
    });

    it('should provide a base tile layer URL', function () {
        TileUrlService.baseLayerUrl().then(function(url) {
            expect(url).toEqual(jasmine.stringMatching(/\.png/));
        });
    });

});
