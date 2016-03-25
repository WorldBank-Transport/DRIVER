'use strict';

describe('driver:map-layers TileUrlService', function () {
    beforeEach(module('driver.map-layers'));

    var TileUrlService;

    beforeEach(inject(function (_TileUrlService_) {
        TileUrlService = _TileUrlService_;
    }));

    it('should provide URLs to access PNG tiles', function () {
        var url = TileUrlService.recTilesUrl('notarealuuid');
        expect(url).toEqual(jasmine.stringMatching(/\.png/));
        expect(url).toEqual(jasmine.stringMatching(/notarealuuid/));
    });

    it('should provide URLs to access UTF Grid tiles', function () {
        var url = TileUrlService.recUtfGridTilesUrl('notarealuuid');
        expect(url).toEqual(jasmine.stringMatching((/\.grid\.json/)));
        expect(url).toEqual(jasmine.stringMatching(/notarealuuid/));
    });

    it('should provide URLs to access boundary tiles', function () {
        var url = TileUrlService.boundaryTilesUrl('notarealuuid');
        expect(url).toEqual(jasmine.stringMatching(/\.png/));
        expect(url).toEqual(jasmine.stringMatching(/notarealuuid/));
    });

    it('should provide URLs to access boundary tiles', function () {
        var url = TileUrlService.recHeatmapUrl('notarealuuid');
        expect(url).toEqual(jasmine.stringMatching(/\.png/));
        expect(url).toEqual(jasmine.stringMatching(/notarealuuid/));
    });

});
