// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-07-07 using
// generator-karma 1.0.0

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      "jasmine"
    ],

    preprocessors: {
      '**/*.html': 'ng-html2js'
    },

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/moment/moment.js',
      'bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020.js',
      'bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
      'bower_components/angular-bootstrap-datetimepicker-directive/angular-bootstrap-datetimepicker-directive.js',
      'bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-aria/angular-aria.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-spinkit/build/angular-spinkit.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/bootstrap-select/dist/js/bootstrap-select.js',
      'bower_components/angular-bootstrap-select/build/angular-bootstrap-select.js',
      'bower_components/angular-uuid/uuid.min.js',
      'bower_components/angular-local-storage/dist/angular-local-storage.js',
      'bower_components/blob-polyfill/Blob.js',
      'bower_components/file-saver.js/FileSaver.js',
      'bower_components/angular-file-saver/dist/angular-file-saver.bundle.js',
      'bower_components/angular-translate/angular-translate.js',
      'bower_components/angular-translate-handler-log/angular-translate-handler-log.js',
      'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js',
      'bower_components/ng-file-upload/ng-file-upload.js',
      'bower_components/json-editor/dist/jsoneditor.js',
      'bower_components/ng-debounce/angular-debounce.js',
      'bower_components/lodash/lodash.js',
      'bower_components/leaflet/dist/leaflet-src.js',
      'bower_components/leaflet-draw/dist/leaflet.draw-src.js',
      'bower_components/Leaflet.utfgrid/dist/leaflet.utfgrid.js',
      'bower_components/d3/d3.js',
      'bower_components/d3-tip/index.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/jjv/lib/jjv.js',
      'bower_components/karma-read-json/karma-read-json.js',
      // endbower
      'app/scripts/config.js',
      'app/scripts/**/*.html',

      // leaflet image resources
      {
          pattern: 'bower_components/leaflet/dist/images/*.png',
          watched: false,
          included: false,
          served: true
      },

      // schema editor scripts
      'app/ase-scripts/config.js',
      'app/ase-scripts/**/*.html',
      'app/ase-scripts/schemas/module.js',
      'app/ase-scripts/schemas/**.js',
      'app/ase-scripts/resources/module.js',
      'app/ase-scripts/resources/**.js',
      'app/ase-scripts/json-editor/module.js',
      'app/ase-scripts/json-editor/**.js',
      'app/ase-scripts/userdata/module.js',
      'app/ase-scripts/userdata/**.js',
      'app/ase-scripts/auth/module.js',
      'app/ase-scripts/auth/**js',

      'app/scripts/audit/module.js',
      'app/scripts/audit/**.js',
      'app/scripts/notifications/module.js',
      'app/scripts/notifications/**.js',
      'app/scripts/navbar/module.js',
      'app/scripts/navbar/**.js',
      'app/scripts/recent-counts/module.js',
      'app/scripts/recent-counts/**.js',
      'app/scripts/recent-proportions/module.js',
      'app/scripts/recent-proportions/**.js',
      'app/scripts/black-spots/module.js',
      'app/scripts/black-spots/**.js',
      'app/scripts/saved-filters/module.js',
      'app/scripts/saved-filters/**.js',
      'app/scripts/custom-reports/module.js',
      'app/scripts/custom-reports/**.js',
      'app/scripts/resources/module.js',
      'app/scripts/resources/**.js',
      'app/scripts/resources/**/*.js',
      'app/scripts/state/module.js',
      'app/scripts/state/*.js',
      'app/scripts/nominatim/module.js',
      'app/scripts/nominatim/*.js',
      'app/scripts/filterbar/module.js',
      'app/scripts/filterbar/**.js',
      'app/scripts/toddow/module.js',
      'app/scripts/toddow/**.js',
      'app/scripts/stepwise/module.js',
      'app/scripts/stepwise/**.js',
      'app/scripts/tools/charts/module.js',
      'app/scripts/tools/charts/**.js',
      'app/scripts/tools/export/module.js',
      'app/scripts/tools/export/**.js',
      'app/scripts/tools/interventions/module.js',
      'app/scripts/tools/interventions/**.js',
      'app/scripts/weather/module.js',
      'app/scripts/weather/**.js',
      'app/scripts/views/account/module.js',
      'app/scripts/views/account/**.js',
      'app/scripts/views/login/module.js',
      'app/scripts/views/login/**.js',
      'app/scripts/views/dashboard/module.js',
      'app/scripts/views/dashboard/**.js',
      'app/scripts/views/duplicates/module.js',
      'app/scripts/views/duplicates/**.js',
      'app/scripts/views/map/module.js',
      'app/scripts/views/map/**.js',
      'app/scripts/views/record/module.js',
      'app/scripts/views/record/**.js',
      'app/scripts/leaflet/module.js',
      'app/scripts/leaflet/**.js',
      'app/scripts/localization/module.js',
      'app/scripts/localization/**.js',
      'app/scripts/map-layers/module.js',
      'app/scripts/map-layers/**/*.js',
      'app/scripts/details/module.js',
      'app/scripts/details/**.js',
      'test/ase-mock/**/*.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js',
      'app/scripts/app.js'
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      "PhantomJS"
    ],

    // Which plugins to enable
    plugins: [
      "karma-phantomjs-launcher",
      "karma-jasmine",
      "karma-ng-html2js-preprocessor"
    ],

    // Load all templates into $templateCache. They can be imported with:
    //   beforeEach(module('ase.templates'));
    ngHtml2JsPreprocessor: {
      stripPrefix: 'app/',
      moduleName: 'ase.templates'
    },

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
