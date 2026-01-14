
import {
    BubbleChartMultiSeries,
    BoxChartMultiSeries
} from '@swimlane/ngx-charts/models/chart-data.model';

export const bubble: BubbleChartMultiSeries = [
    {
        name: 'Germany',
        series: [
            {
                name: '2010',
                x: '2010',
                y: 80.3,
                r: 80.4
            },
            {
                name: '2000',
                x: '2000',
                y: 80.3,
                r: 78
            },
            {
                name: '1990',
                x: '1990',
                y: 75.4,
                r: 79
            }
        ]
    },
    {
        name: 'United States',
        series: [
            {
                name: '2010',
                x: '2010',
                y: 78.8,
                r: 310
            },
            {
                name: '2000',
                x: '2000',
                y: 76.9,
                r: 283
            },
            {
                name: '1990',
                x: '1990',
                y: 75.4,
                r: 253
            }
        ]
    },
    {
        name: 'France',
        series: [
            {
                name: '2010',
                x: '2010',
                y: 81.4,
                r: 63
            },
            {
                name: '2000',
                x: '2000',
                y: 79.1,
                r: 59.4
            },
            {
                name: '1990',
                x: '1990',
                y: 77.2,
                r: 56.9
            }
        ]
    },
    {
        name: 'United Kingdom',
        series: [
            {
                name: '2010',
                x: '2010',
                y: 80.2,
                r: 62.7
            },
            {
                name: '2000',
                x: '2000',
                y: 77.8,
                r: 58.9
            },
            {
                name: '1990',
                x: '1990',
                y: 75.7,
                r: 57.1
            }
        ]
    }
];

export const boxData: BoxChartMultiSeries = [
    {
        name: 'Colombia',
        series: [
            {
                name: '2019',
                value: 12
            },
            {
                name: '2020',
                value: 23
            },
            {
                name: '2021',
                value: 34
            },
            {
                name: '2022',
                value: 27
            },
            {
                name: '2023',
                value: 18
            },
            {
                name: '2024',
                value: 45
            }
        ]
    },
    {
        name: 'Chile',
        series: [
            {
                name: '2019',
                value: 20
            },
            {
                name: '2020',
                value: 28
            },
            {
                name: '2021',
                value: 42
            },
            {
                name: '2022',
                value: 39
            },
            {
                name: '2023',
                value: 31
            },
            {
                name: '2024',
                value: 61
            }
        ]
    },
    {
        name: 'Perú',
        series: [
            {
                name: '2019',
                value: 47
            },
            {
                name: '2020',
                value: 62
            },
            {
                name: '2021',
                value: 55
            },
            {
                name: '2022',
                value: 42
            },
            {
                name: '2023',
                value: 49
            },
            {
                name: '2024',
                value: 71
            }
        ]
    }
];
