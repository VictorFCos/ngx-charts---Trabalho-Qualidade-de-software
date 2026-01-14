
export const otherCharts = [
    {
        name: 'Bubble Chart',
        selector: 'bubble-chart',
        inputFormat: 'bubble',
        options: [
            'animations',
            'colorScheme',
            'schemeType',
            'showXAxis',
            'showYAxis',
            'showLegend',
            'legendTitle',
            'legendPosition',
            'showXAxisLabel',
            'xAxisLabel',
            'showYAxisLabel',
            'yAxisLabel',
            'showGridLines',
            'roundDomains',
            'autoScale',
            'minRadius',
            'maxRadius',
            'tooltipDisabled',
            'xScaleMin',
            'xScaleMax',
            'yScaleMin',
            'yScaleMax',
            'trimXAxisTicks',
            'trimYAxisTicks',
            'rotateXAxisTicks',
            'maxXAxisTickLength',
            'maxYAxisTickLength',
            'wrapTicks'
        ],
        defaults: {
            xAxisLabel: 'Census Date',
            yAxisLabel: 'Life expectancy [years]'
        }
    },
    {
        name: 'Box Chart',
        selector: 'box-plot',
        inputFormat: 'boxMultiSeries',
        options: [
            'animations',
            'colorScheme',
            'schemeType',
            'showXAxis',
            'showYAxis',
            'showLegend',
            'legendTitle',
            'legendPosition',
            'showXAxisLabel',
            'xAxisLabel',
            'showYAxisLabel',
            'yAxisLabel',
            'showGridLines',
            'roundDomains',
            'roundEdges',
            'strokeColor',
            'strokeWidth',
            'tooltipDisabled',
            'gradient'
        ],
        defaults: {
            xAxisLabel: 'Latin American Countries',
            yAxisLabel: ' Average Wage [USD]'
        }
    },
    {
        name: 'Sankey Chart',
        selector: 'sankey',
        inputFormat: 'sankey',
        options: ['animations', 'colorScheme', 'schemeType', 'tooltipDisabled', 'showLabels'],
        defaults: {}
    },
    {
        name: 'Force Directed Graph (deprecated)',
        selector: 'force-directed-graph',
        inputFormat: 'graph',
        options: ['animations', 'colorScheme', 'showLegend', 'legendTitle', 'legendPosition', 'tooltipDisabled']
    },
    {
        name: 'Heat Map',
        selector: 'heat-map',
        inputFormat: 'multiSeries',
        options: [
            'animations',
            'colorScheme',
            'showXAxis',
            'showYAxis',
            'gradient',
            'showLegend',
            'showXAxisLabel',
            'xAxisLabel',
            'showYAxisLabel',
            'yAxisLabel',
            'innerPadding',
            'tooltipDisabled',
            'trimXAxisTicks',
            'trimYAxisTicks',
            'rotateXAxisTicks',
            'maxXAxisTickLength',
            'maxYAxisTickLength',
            'min',
            'max',
            'wrapTicks'
        ],
        defaults: {
            yAxisLabel: 'Census Date',
            cAxisLabel: 'Country'
        }
    },
    {
        name: 'Tree Map',
        selector: 'tree-map',
        inputFormat: 'singleSeries',
        options: ['animations', 'colorScheme', 'tooltipDisabled', 'gradient']
    },
    {
        name: 'Number Cards',
        selector: 'number-card',
        inputFormat: 'singleSeries',
        options: ['animations', 'colorScheme']
    },
    {
        name: 'Gauge',
        selector: 'gauge',
        inputFormat: 'singleSeries',
        options: [
            'showLegend',
            'legendTitle',
            'legendPosition',
            'colorScheme',
            'min',
            'max',
            'largeSegments',
            'smallSegments',
            'units',
            'angleSpan',
            'startAngle',
            'showAxis',
            'margin',
            'tooltipDisabled',
            'animations',
            'showText'
        ]
    },
    {
        name: 'Linear Gauge',
        selector: 'linear-gauge',
        inputFormat: 'single',
        options: ['animations', 'colorScheme', 'value', 'previousValue', 'min', 'max', 'units']
    },
    {
        name: 'Percent Gauge',
        selector: 'percent-gauge',
        inputFormat: 'single',
        options: ['animations', 'colorScheme', 'value', 'max', 'target', 'showLabel']
    }
];
