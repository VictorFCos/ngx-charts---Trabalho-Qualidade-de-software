
import {
    SingleSeries,
    MultiSeries
} from '@swimlane/ngx-charts/models/chart-data.model';

export const single: SingleSeries = [
    {
        name: 'Germany',
        value: 40632,
        extra: {
            code: 'de'
        }
    },
    {
        name: 'United States',
        value: 50000,
        extra: {
            code: 'us'
        }
    },
    {
        name: 'France',
        value: 36745,
        extra: {
            code: 'fr'
        }
    },
    {
        name: 'United Kingdom',
        value: 36240,
        extra: {
            code: 'uk'
        }
    },
    {
        name: 'Spain',
        value: 33000,
        extra: {
            code: 'es'
        }
    },
    {
        name: 'Italy',
        value: 35800,
        extra: {
            code: 'it'
        }
    }
];

export const multi: MultiSeries = [
    {
        name: 'Germany',
        series: [
            {
                name: '2010',
                value: 40632,
                extra: {
                    code: 'de'
                }
            },
            {
                name: '2000',
                value: 36953,
                extra: {
                    code: 'de'
                }
            },
            {
                name: '1990',
                value: 31476,
                extra: {
                    code: 'de'
                }
            }
        ]
    },
    {
        name: 'United States',
        series: [
            {
                name: '2010',
                value: 0,
                extra: {
                    code: 'us'
                }
            },
            {
                name: '2000',
                value: 45986,
                extra: {
                    code: 'us'
                }
            },
            {
                name: '1990',
                value: 37060,
                extra: {
                    code: 'us'
                }
            }
        ]
    },
    {
        name: 'France',
        series: [
            {
                name: '2010',
                value: 36745,
                extra: {
                    code: 'fr'
                }
            },
            {
                name: '2000',
                value: 34774,
                extra: {
                    code: 'fr'
                }
            },
            {
                name: '1990',
                value: 29476,
                extra: {
                    code: 'fr'
                }
            }
        ]
    },
    {
        name: 'United Kingdom',
        series: [
            {
                name: '2010',
                value: 36240,
                extra: {
                    code: 'uk'
                }
            },
            {
                name: '2000',
                value: 32543,
                extra: {
                    code: 'uk'
                }
            },
            {
                name: '1990',
                value: 26424,
                extra: {
                    code: 'uk'
                }
            }
        ]
    }
];

export const fiscalYearReport: MultiSeries = [
    {
        name: 'Q1',
        series: [
            {
                name: '1001',
                value: -10632
            },
            {
                name: '2001',
                value: -36953
            }
        ]
    },
    {
        name: 'Q2',
        series: [
            {
                name: '1001',
                value: -19737
            },
            {
                name: '2001',
                value: 45986
            }
        ]
    },
    {
        name: 'Q3',
        series: [
            {
                name: '1001',
                value: -16745
            },
            {
                name: '2001',
                value: 0
            }
        ]
    },
    {
        name: 'Q4',
        series: [
            {
                name: '1001',
                value: -16240
            },
            {
                name: '2001',
                value: 32543
            }
        ]
    }
];
