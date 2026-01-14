
export const demosBasic = [
    {
        name: 'Combo Chart',
        selector: 'combo-chart',
        inputFormat: 'comboChart',
        options: [
            'animations',
            'showXAxis',
            'showYAxis',
            'gradient',
            'showLegend',
            'noBarWhenZero',
            'legendTitle',
            'legendPosition',
            'showXAxisLabel',
            'xAxisLabel',
            'showYAxisLabel',
            'yAxisLabel',
            'showGridLines',
            'roundDomains',
            'tooltipDisabled'
        ]
    },
    {
        name: 'Heat Map - Calendar',
        selector: 'calendar',
        inputFormat: 'calendarData',
        options: [
            'animations',
            'colorScheme',
            'showXAxis',
            'showYAxis',
            'gradient',
            'showLegend',
            'innerPadding',
            'tooltipDisabled',
            'trimXAxisTicks',
            'trimYAxisTicks',
            'maxXAxisTickLength',
            'maxYAxisTickLength'
        ],
        defaults: {
            width: 1100,
            height: 200
        }
    },
    {
        name: 'Number Cards - Status',
        selector: 'status-demo',
        inputFormat: 'statusData',
        options: ['animations', 'colorScheme']
    },
    {
        name: 'TreeMap - Interactive',
        selector: 'tree-map-demo',
        inputFormat: 'treemap',
        options: ['animations', 'colorScheme']
    },
    {
        name: 'Bubble Chart - Interactive',
        selector: 'bubble-chart-interactive-demo',
        inputFormat: 'bubbleInteractive',
        options: [
            'animations',
            'colorScheme',
            'schemeType',
            'showXAxis',
            'showYAxis',
            'showLegend',
            'legendTitle',
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
            'yScaleMax'
        ],
        defaults: {
            xAxisLabel: 'Order Total',
            yAxisLabel: 'Order Item Count',
            showLegend: false,
            minRadius: 5,
            maxRadius: 20
        }
    },
    {
        name: 'Equation Plots',
        selector: 'plot-demo',
        inputFormat: 'statusData',
        options: [
            'animations',
            'colorScheme',
            'schemeType',
            'showXAxis',
            'showYAxis',
            'autoScale',
            'showGridLines',
            'gradient',
            'roundDomains',
            'tooltipDisabled',
            'trimXAxisTicks',
            'trimYAxisTicks',
            'maxXAxisTickLength',
            'maxYAxisTickLength'
        ]
    }
];
