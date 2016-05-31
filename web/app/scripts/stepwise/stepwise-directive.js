/**
 * This directive creates a stepwise graph for aggregating information event occurrence.
 *  The bound variable `chartData` needs only be a list of objects which contain (by default)
 *  the property 'occurred_from'.
 */

(function () {
    'use strict';

    /* ngInject */
    function Stepwise($translate, LanguageState) {
        var module = {
            restrict: 'E',
            scope: {
              chartData: '=',
              minDate: '=',
              maxDate: '='
            },
            template: '<svg></svg>',
            link: function(scope, elem) {
                var margin = {top: 6, right: 20, bottom: 58, left: 30},
                    width = 660 - margin.left - margin.right,
                    height = 230 - margin.top - margin.bottom;

                // GLOBALS
                var svg, xAxis, yAxis;  // GLOBAL
                // scales -- set in init
                var xRange;
                var tScale;
                var x;
                var y;

                // Need to set after initialization to guarantee translations are available
                var tooltip = null;

                $translate.onReady(init);

                /**
                 * Initialize graph to make clean updates possible in a separate, 'updateChart',
                 *  function. Grab the SVG, manipulate it, generate tooltips, gather rectangle
                 *  elements together under `rect`.
                 */
                function init() {
                    var isRightToLeft = LanguageState.getSelected().rtl;

                    xRange = isRightToLeft ? [width, 0] : [0, width];
                    tScale = d3.time.scale().range(xRange);
                    x = d3.scale.ordinal().rangeBands(xRange, 0.05);
                    y = d3.scale.linear().range([height, 0]);

                    /**
                     * Watch for changes to chartData and redraw
                     */
                    scope.$watch('chartData', function(newVal) {
                        if (newVal) {
                            var data = formatData(newVal);
                            updateChart(data, isRightToLeft);
                        }
                    });

                    tooltip = d3.tip().html(function(d) {
                        return '<strong>' +
                            $translate.instant('RECORD.WEEK_OF') +
                            ': </strong>' +
                            d.dt.toLocaleDateString() +
                            '</br><strong>' +
                            $translate.instant('RECORD.EVENT_COUNT') +
                            ':</strong> <span>' +
                            d.count +
                            '</span>';
                    }).offset([-20,-15]);

                    var rawSvg = elem.find('svg')[0];
                    var bufferedWidth = width + margin.left + margin.right;
                    var bufferedHeight = height + margin.top + margin.bottom;

                    svg = d3.select(rawSvg)
                        .attr('viewBox', '0 0 ' + bufferedWidth + ' ' + bufferedHeight)
                        .attr('preserveAspectRatio', 'xMinYMin')
                        .append('g')
                        .attr('class', 'outer')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top +')');

                    xAxis = d3.svg.axis()
                        .scale(tScale)
                        .tickFormat(d3.time.format('%b %y'))
                        .ticks(5)
                        .orient('bottom');

                    yAxis = d3.svg.axis()
                        .scale(y)
                        .orient('left')
                        .tickSize(1);

                    svg.append('g')
                      .attr('class', 'yAxis')
                      .attr('transform', 'translate(' + (isRightToLeft ? width : 0) + ',0)')
                      .call(yAxis)
                      .attr('x', -100)
                      .selectAll('text')
                        .attr('text-anchor', 'right')
                        .attr('x', -25)
                        .attr('dy', 0);
                }

                /**
                 * Update all fields of chart with new information and draw in cells with events
                 *
                 * @param data {array} the data to change our chart with
                 */
                function updateChart(data, isRightToLeft) {
                    svg.call(tooltip);

                    // Get the max count and use it for the number of ticks.
                    // If 2 or less, just use 2. if 10 or more, just use 10.
                    var maxCount = _.max(_.map(data, function(d) { return d.count; }));
                    yAxis.scale(y)
                        .ticks(Math.min(10, Math.max(2, maxCount)));

                    svg.selectAll('rect').remove();
                    svg.selectAll('.tick').remove();

                    svg.selectAll('bar')
                        .attr('class', 'test')
                        .data(data)
                    .enter().append('rect')
                      .style('fill', '#337ab7')
                      .attr('data-date', function(d) { return d.dt.toLocaleDateString(); })
                      .attr('class', 'bar')
                      .attr('x', function(d) { return x(d.dt.toLocaleDateString()); })
                      .attr('width', x.rangeBand())
                      .attr('y', function(d) { return y(d.count); })
                      .attr('height', function(d) { return height - y(d.count); })
                      .on('mouseover', tooltip.show)
                      .on('mouseout', tooltip.hide);

                    svg.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + height + ')')
                        .transition()
                        .call(xAxis)
                        .selectAll('text')
                            .attr('class', 'label')
                            .style('text-anchor', 'end')
                            .attr('dx', isRightToLeft ? '-3.9em' : '-0.8em')
                            .attr('dy', isRightToLeft ? '0.3em' : '0.15em')
                            .attr('transform', 'rotate(-50)');

                    svg.select('.yAxis')
                        .transition()
                        .call(yAxis)
                        .selectAll('text')
                            .attr('class', 'label')
                            .attr('x', isRightToLeft ? 2 : -2);
                }

                function getWeek(datetimeISO) {
                    return d3.time.week(new Date(datetimeISO));
                }

                /**
                 * Helper function for producing an array of all the weeks between the earliest
                 *  and the latest dates in the provided datetimes
                 *
                 *  @param dts {object} A datetime object having (at least) the form:
                 *                       [{'dt': <moment datetime object>},...]
                 */
                function weekRange(dts) {
                // Get earliest and latest weeks
                    var justDT = _.map(dts, function(d) { return d.dt; });
                    // minDT and maxDT will use the filter data and fall back on non-zero data they
                    // receive from the server
                    var minDT, maxDT;
                    if (scope.minDate) {
                        minDT = moment(d3.time.week(new Date(scope.minDate)));
                    } else {
                        minDT = moment.min(justDT);
                    }

                    if (scope.maxDate) {
                        maxDT = moment(d3.time.week(new Date(scope.maxDate)));
                    } else {
                        maxDT = moment.max(justDT);
                    }

                    // We need to iterate through weeks between the earliest and the latest so that
                    //  we might properly zero-fill the empty data
                    var arr = [];
                    var maxUnix = maxDT.unix();
                    for(var i = minDT.clone(); i.unix() <= maxUnix; i = i.clone().add(1, 'week')) {
                        // Call `toDate` for D3 axis consumption
                        arr.push(getWeek(i.toDate()));
                    }

                    return arr;
                }

                /**
                 * Helper function to gather data together into a format more friendly to D3
                 */
                function formatData(data) {
                    var momentData = _.map(data, function(d) {
                        return {
                            'dt': moment().year(d.year).week(d.week),
                            'count': d.count
                        };
                    });
                    var allWeeks = weekRange(momentData);
                    var maxCount = _.max(data, function(d) { return d.count; }).count || 10;

                    // Set the domain for our X scale - it NEEDS to be at a lower precision than
                    //  seconds to prevent behavioral abnormalities
                    tScale.domain([new Date(allWeeks[0]),
                                 new Date(allWeeks[allWeeks.length - 1])]);
                    x.domain(_.map(allWeeks, function(d) { return d.toLocaleDateString(); }));
                    y.domain([0, maxCount]);

                    // Produce the base array of objects
                    var allTemporalData =
                        _.map(momentData, function(d) {
                            return {'dt': getWeek(d.dt.toDate()),
                            'count': d.count};
                        }).concat(
                            _.map(allWeeks, function(d) {
                                return {'dt': getWeek(d), 'count': 0};
                            })
                        );

                    return _.uniq(allTemporalData, function(d) { return d.dt.toLocaleDateString(); });
                }
            }
        };
        return module;
    }

    angular.module('driver.stepwise')
    .directive('driverStepwise', Stepwise);

})();
