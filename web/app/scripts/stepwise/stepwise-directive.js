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
            restrict: 'E',
            scope: {
              chartData: '='
            },
            template: '<svg></svg>',
            link: function(scope, elem) {
                var margin = {top: 6, right: 20, bottom: 58, left: 30},
                    width = 660 - margin.left - margin.right,
                    height = 230 - margin.top - margin.bottom;

                // GLOBALS
                var t0, svg, line, xAxis, yAxis;  // GLOBAL
                // scales
                var x = d3.scale.linear().domain([0, 0]).range([10, width]);
                var y = d3.scale.linear().domain([0,100]).range([height - 10, 0]);

                var isWeekly = true; // monthly if false

                var tooltip = d3.tip();
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
                    var bufferedWidth = width + margin.left + margin.right;
                    var bufferedHeight = height + margin.top + margin.bottom;

                    svg = d3.select(rawSvg)
                        .attr('viewBox', '0 0 ' + bufferedWidth + ' ' + bufferedHeight)
                        .attr('preserveAspectRatio', 'xMinYMin')
                        .append('g')
                        .attr('class', 'outer')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top +')');

                    svg.append('path')
                        .attr('class', 'line')
                        .attr('stroke', 'black');

                    xAxis = d3.svg.axis()
                        .scale(x)
                        .tickSize(1);

                    yAxis = d3.svg.axis()
                        .scale(y)
                        .orient('left')
                        .tickSize(1);

                    svg.append('g')
                      .attr('class', 'xAxis')
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
                    svg.call(tooltip);
                    tooltip.html(function(d) {
                        var text = d.count || '0';
                        return 'Event count: ' + text;
                    });

                    y.domain([0, d3.max(data, function(d) { return d.count; })]);
                    yAxis.scale(y)
                        .ticks(Math.min(10, _.max(_.map(data, function(d) { return d.count; }))));
                    xAxis.scale(x)
                        .tickFormat(xAxisTextFormat)
                        // explicitly match number of labels on x axis to match number of values
                        // displayed, to avoid duplicate tick labels showing up in between points
                        .tickValues(d3.range(xAxis.scale().domain()[0], xAxis.scale().domain()[1] + 1));

                    svg.select('.xAxis')
                        .transition()
                        .call(xAxis)
                        .selectAll('text')
                            .attr('text-anchor', 'end')
                            .attr('x', 8)
                            .attr('y', 0)
                            .attr('dx', '-3em')
                            .attr('dy', '.4em')
                            .attr('transform', 'rotate(-65)');

                    svg.select('.yAxis').transition().call(yAxis);

                    line = d3.svg.area()
                        .x(function(d) { return x(d.period); })
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
                        .attr('cx', function(d) { return x(d.period); })
                        .attr('cy', function(d) { return y(d.count); })
                        .attr('data-index', function(d) { return d.period; })
                        .attr('data-count', function(d) { return d.count; })
                        .attr('data-date', function(d) { return d.date; })
                        .attr('stroke-width', 'none')
                        .attr('fill-opacity', '0.4')
                        .attr('r', 6)
                        .on('mouseover', function(d) { try { tooltip.show(d); } catch(e) {} })
                        .on('mouseout', tooltip.hide);
                }

                function getWeek(datetimeISO) {
                    return d3.time.week(new Date(datetimeISO));
                }

                function getMonth(datetimeISO) {
                    return d3.time.month(new Date(datetimeISO));
                }

                /**
                 * Helper function to pick a function to create x axis label text
                 *
                 * @param period {int} the period index for the data point in question
                 */
                function xAxisTextFormat(period) {
                    if (isWeekly) {
                        return xAxisTextFormatWeek(period);
                    } else {
                        return xAxisTextFormatMonth(period);
                    }
                }

                /**
                 * Helper function to create x axis label text
                 *
                 * @param week {int} the week index for the data point in question
                 */
                function xAxisTextFormatWeek(week) {
                    return moment(getWeek(t0.clone().add(week, 'week'))).format('MM-DD-YY');
                }

                /**
                 * Helper function to create x axis label text
                 *
                 * @param month {int} the month index for the data point in question
                 */
                function xAxisTextFormatMonth(month) {
                    return moment(getMonth(t0.clone().add(month, 'month'))).format('MM-DD-YY');
                }

                /**
                 * Helper function to gather data together into a format more friendly to D3
                 */
                function formatData(events, dateField) {
                    // group elements by week-belonged-to
                    isWeekly = true;
                    var groupedEvents = _(events)
                      .groupBy(function(d) { return getWeek(d[dateField]); })
                      .map(function(d) {
                          return {'date': getWeek(d[0][dateField])};
                      }).value();

                    // set t0 (the first week)
                    t0 = moment(_.min(groupedEvents, function(d) { return d.date; }).date);
                    var tFinal = moment(_.max(groupedEvents, function(d) { return d.date; }).date);
                    var tDiff = tFinal.clone().diff(t0.clone(), 'weeks');
                    var tRange = _.range(tDiff + 1);

                    // display as monthly instead of weekly if have more than 12 weeks
                    // TODO: find better way to check date range extent before computing so much
                    /*
                    if (tDiff > 12) {
                        console.log('have >12 weeks');
                        //////////////////////

                        isWeekly = false;

                        groupedEvents = _(events)
                          .groupBy(function(d) { return getMonth(d[dateField]); })
                          .map(function(d) {
                              return {'date': getMonth(d[0][dateField])};
                          }).value();

                        // set t0 (the first month)
                        t0 = moment(_.min(groupedEvents, function(d) { return d.date; }).date);
                        tFinal = moment(_.max(groupedEvents, function(d) { return d.date; }).date);
                        tDiff = tFinal.clone().diff(t0.clone(), 'months');
                        tRange = _.range(tDiff + 1);
                    }
                    */

                    // Set the domain for our X scale
                    x.domain([0,tDiff]);

                    // Produce the base array of objects
                    var dates = _.map(tRange, function(date) {

                        var periodDate;
                        if (isWeekly) {
                            periodDate = getWeek(t0.clone().add(date, 'week').toISOString());
                        } else {
                            periodDate = getMonth(t0.clone().add(date, 'month').toISOString());
                        }
                        return {
                            'date': periodDate,
                            'period': date,
                            'count': 0
                        };
                    });
                    // Loop over base array, applying changes based on `groupedEvents` data
                    // TODO: this looks buggy; seems it only returns 1 or 0
                    // probably should be checking date range instead of exact date
                    _.forEach(dates, function(d, i) {
                        var match = _.filter(groupedEvents, function(ev) {
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
