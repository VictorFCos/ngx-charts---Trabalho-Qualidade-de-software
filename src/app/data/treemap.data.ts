
import { TreeMapData } from '@swimlane/ngx-charts/models/chart-data.model';
import { analytics, animate } from './treemap-analytics.data';
import { query } from './treemap-query.data';
import { util, vis } from './treemap-util.data';

export const treemap: TreeMapData = [
    {
        name: 'flare',
        children: [
            analytics,
            animate,
            {
                name: 'data',
                children: [
                    {
                        name: 'converters',
                        children: [
                            { name: 'Converters', size: 721 },
                            { name: 'DelimitedTextConverter', size: 4294 },
                            { name: 'GraphMLConverter', size: 9800 },
                            { name: 'IDataConverter', size: 1314 },
                            { name: 'JSONConverter', size: 2220 }
                        ]
                    },
                    { name: 'DataField', size: 1759 },
                    { name: 'DataSchema', size: 2165 },
                    { name: 'DataSet', size: 586 },
                    { name: 'DataSource', size: 3331 },
                    { name: 'DataTable', size: 772 },
                    { name: 'DataUtil', size: 3322 }
                ]
            },
            {
                name: 'display',
                children: [
                    { name: 'DirtySprite', size: 8833 },
                    { name: 'LineSprite', size: 1732 },
                    { name: 'RectSprite', size: 3623 },
                    { name: 'TextSprite', size: 10066 }
                ]
            },
            {
                name: 'flex',
                children: [{ name: 'FlareVis', size: 4116 }]
            },
            {
                name: 'physics',
                children: [
                    { name: 'DragForce', size: 1082 },
                    { name: 'GravityForce', size: 1336 },
                    { name: 'IForce', size: 319 },
                    { name: 'NBodyForce', size: 10498 },
                    { name: 'Particle', size: 2822 },
                    { name: 'Simulation', size: 9983 },
                    { name: 'Spring', size: 2213 },
                    { name: 'SpringForce', size: 1681 }
                ]
            },
            query,
            {
                name: 'scale',
                children: [
                    { name: 'IScaleMap', size: 2105 },
                    { name: 'LinearScale', size: 1316 },
                    { name: 'LogScale', size: 3151 },
                    { name: 'OrdinalScale', size: 3770 },
                    { name: 'QuantileScale', size: 2435 },
                    { name: 'QuantitativeScale', size: 4839 },
                    { name: 'RootScale', size: 1756 },
                    { name: 'Scale', size: 4268 },
                    { name: 'ScaleType', size: 1821 },
                    { name: 'TimeScale', size: 5833 }
                ]
            },
            util,
            vis
        ]
    }
];
