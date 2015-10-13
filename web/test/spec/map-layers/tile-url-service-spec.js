'use strict';

describe('driver:map-layers TileUrlService', function () {
    beforeEach(module('driver.map-layers'));

    var TileUrlService;
    var $rootScope;

    beforeEach(inject(function (_$rootScope_, _TileUrlService_) {
        TileUrlService = _TileUrlService_;
        $rootScope = _$rootScope_;
    }));

    it('should provide URLs to access PNG tiles', function () {
        TileUrlService.recTilesUrl('notarealuuid').then(function(url) {
            expect(url).toEqual(jasmine.stringMatching(/\.png/));
            expect(url).toEqual(jasmine.stringMatching(/notarealuuid/));
        });
        $rootScope.$apply();
    });

    it('should provide URLs to access UTF Grid tiles', function () {
        TileUrlService.recUtfGridTilesUrl('notarealuuid').then(function(url) {
            expect(url).toEqual(jasmine.stringMatching((/\.grid\.json/)));
            expect(url).toEqual(jasmine.stringMatching(/notarealuuid/));
        });
        $rootScope.$apply();
    });

    it('should provide URLs to access boundary tiles', function () {
        TileUrlService.boundaryTilesUrl('notarealuuid').then(function(url) {
            expect(url).toEqual(jasmine.stringMatching(/\.png/));
            expect(url).toEqual(jasmine.stringMatching(/notarealuuid/));
        });
        $rootScope.$apply();
    });

    it('should provide URLs to access boundary tiles', function () {
        TileUrlService.recHeatmapUrl('notarealuuid').then(function(url) {
            expect(url).toEqual(jasmine.stringMatching(/\.png/));
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
