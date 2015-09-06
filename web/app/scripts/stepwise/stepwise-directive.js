/**
 * This directive creates a stepwise graph for aggregating information event occurrence.
 *  The bound variable `chartData` needs only be a list of objects which contain (by default)
 *  the property 'occurred_from'.
 */

(function () {
    'use strict';

    /* ngInject */
    function Stepwise() {
        var module = {
            restrict: 'A',
            scope: {
              chartData: '='
            },
            template: '<svg></svg>',
            link: function(scope, elem) {
                var margin = {top: 20, right: 20, bottom: 30, left: 30},
                    width = 475 - margin.left - margin.right,
                    height = 275 - margin.top - margin.bottom;

                // GLOBALS
                var t0, svg, line, xAxis, yAxis;  // GLOBAL
                // scales
                var x = d3.scale.linear().domain([0, 0]).range([10, width]);
                var y = d3.scale.linear().domain([0,100]).range([height - 10, 0]);

                init();

                /**
                 * Watch for changes to chartData and redraw and redraw and redraw
                 */
                scope.$watch('chartData', function(val) {
                    if (val) {
                        var dateField = scope.dateField || 'occurred_from';
                        var data = formatData(val, dateField);
                        updateChart(data);
                    }
                });

                /**
                 * Initialize graph to make clean updates possible in a separate, 'updateChart',
                 *  function. Grab the SVG, manipulate it, generate tooltips, gather rectangle
                 *  elements together under `rect`.
                 */
                function init() {
                    var rawSvg = elem.find('svg')[0];
                    svg = d3.select(rawSvg)
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom)
                        .append('g')
                        .attr('class', 'outer')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top +')');

                    svg.append('path')
                        .attr('class', 'line')
                        .attr('stroke', 'black');

                    xAxis = d3.svg.axis()
                        .scale(x)
                        .orient('bottom')
                        .tickSize(1);

                    yAxis = d3.svg.axis()
                        .scale(y)
                        .orient('left')
                        .tickSize(1);

                    svg.append('g')
                      .attr('class', 'xAxis')
                      //.call(xAxis)  // TODO: uncomment after worldbank demo
                      .attr('text-anchor', 'middle')
                      .attr('transform', 'translate(0,' + height + ')');

                    svg.append('g')
                      .attr('class', 'yAxis')
                      .call(yAxis)
                      .selectAll('text')
                        .attr('text-anchor', 'right')
                        .attr('x', 4)
                        .attr('dy', -4);
                }

                /**
                 * Update all fields of chart with new information and draw in cells with events
                 *
                 * @param data {array} the data to change our chart with
                 */
                function updateChart(data) {
                    y.domain([0, d3.max(data, function(d) { return d.count; })]);
                    yAxis.scale(y)
                        .ticks(Math.min(10, _.max(_.map(data, function(d) { return d.count; }))));
                    xAxis.scale(x)
                        .tickFormat(xAxisTextFormat);

                    svg.select('.xAxis').transition().call(xAxis);  // TODO: uncomment
                    svg.select('.yAxis').transition().call(yAxis);

                    line = d3.svg.area()
                        .x(function(d) { return x(d.week); })
                        .y(function(d) { return y(d.count); })
                        .interpolate('step-after');

                    svg.select('path')
                        .datum(data)
                        .transition()
                        .ease('cubic')
                        .attr('d', line);

                    svg.selectAll('circle')
                        .remove();

                    svg.append('g')
                        .attr('class', 'points')
                        .selectAll('circle')
                        .data(data)
                        .enter().append('svg:circle')
                        .attr('cx', function(d) { return x(d.week); })
                        .attr('cy', function(d) { return y(d.count); })
                        .attr('data-index', function(d) { return d.week; })
                        .attr('data-count', function(d) { return d.count; })
                        .attr('data-date', function(d) { return d.date; })
                        .attr('stroke-width', 'none')
                        .attr('fill', 'blue')
                        .attr('r', 5);

                }

                function getWeek(datetimeISO) {
                    return d3.time.week(new Date(datetimeISO));
                }

                /**
                 * Helper function to create x axis label text
                 *
                 * @param week {int} the week index for the data point in question
                 */
                function xAxisTextFormat(week) {
                    return moment(getWeek(t0.clone().add(week, 'week'))).format('DD-MM-YY');
                }

                /**
                 * Helper function to gather data together into a format more friendly to D3
                 */
                function formatData(events, dateField) {
                    // group elements by week-belonged-to
                    var weeklyEvents = _(events)
                      .groupBy(function(d) { return getWeek(d[dateField]); })
                      .map(function(d) {
                          return {'date': getWeek(d[0][dateField])};
                      }).value();

                    // set t0 (the first week)
                    t0 = moment(_.min(weeklyEvents, function(d) { return d.date; }).date);
                    var tFinal = moment(_.max(weeklyEvents, function(d) { return d.date; }).date);
                    var tDiff = tFinal.clone().diff(t0.clone(), 'weeks');
                    var tRange = _.range(tDiff + 1);

                    // Set the domain for our X scale
                    x.domain([0,tDiff]);

                    // Produce the base array of objects
                    var dates = _.map(tRange, function(date) {
                        return {
                            'date': getWeek(t0.clone().add(date, 'week').toISOString()),
                            'week': date,
                            'count': 0
                        };
                    });
                    // Loop over base array, applying changes based on `weeklyEvents` data
                    _.forEach(dates, function(d, i) {
                        var match = _.filter(weeklyEvents, function(ev) {
                            return d.date.getTime() === ev.date.getTime();
                        });
                        if (match) {
                            dates[i].count = match.length;
                        }
                    });
                    return dates;
                }
            }
        };
        return module;
    }

    angular.module('driver.stepwise')
    .directive('driverStepwise', Stepwise);

})();
