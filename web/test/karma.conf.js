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
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-aria/angular-aria.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/ng-file-upload/ng-file-upload.js',
      'bower_components/angular-spinkit/build/angular-spinkit.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/json-editor/dist/jsoneditor.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/lodash/lodash.js',
      'bower_components/angular-uuid/uuid.min.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/jjv/lib/jjv.js',
      'bower_components/karma-read-json/karma-read-json.js',
      // endbower
      'app/scripts/config.js',
      'app/scripts/**/*.html',

      // schema editor scripts
      'app/ase-scripts/config.js',
      'app/ase-scripts/**/*.html',
      'app/ase-scripts/schemas/module.js',
      'app/ase-scripts/schemas/**.js',
      'app/ase-scripts/resources/module.js',
      'app/ase-scripts/resources/**.js',
      'app/ase-scripts/json-editor/module.js',
      'app/ase-scripts/json-editor/**.js',
      'app/scripts/notifications/module.js',
      'app/scripts/notifications/**.js',

      'app/scripts/views/record/module.js',
      'app/scripts/views/record/**.js',
      'app/scripts/views/home/module.js',
      'app/scripts/views/home/**.js',
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
    //   beforeEach(module('driver.templates'));
    ngHtml2JsPreprocessor: {
      stripPrefix: 'app/',
      moduleName: 'driver.templates'
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
