
import { data as countries } from 'emoji-flags';
import {
    SingleSeries,
    MultiSeries,
    Series
} from '@swimlane/ngx-charts/models/chart-data.model';

export function generateGraph(nodeCount: number) {
    const nodes = [];
    const links = [];
    for (let i = 0; i < nodeCount; i++) {
        const country = countries[Math.floor(Math.random() * countries.length)];
        nodes.push({
            value: country.name
        });
        for (let j = 0; j < nodes.length - 1; j++) {
            if (Math.random() < 0.03) {
                links.push({
                    source: country,
                    target: nodes[j].value
                });
            }
        }
    }
    return { links, nodes };
}

export function timelineFilterBarData(): SingleSeries {
    const results: SingleSeries = [];
    const dataPoints = 30;
    const dayLength = 24 * 60 * 60 * 1000;
    let date = 1473700105009; // Sep 12, 2016
    for (let j = 0; j < dataPoints; j++) {
        // random dates between Sep 12, 2016 and Sep 24, 2016
        results.push({
            name: new Date(date),
            value: Math.floor(Math.random() * 300)
        });
        date += dayLength;
    }
    if (!results.some(r => r.value === 0)) {
        results[Math.floor(Math.random() * results.length)].value = 0;
    }

    return results;
}

export function generateData(seriesLength: number, includeMinMaxRange: boolean, dataPoints: number = 5): MultiSeries {
    const results: MultiSeries = [];

    const domain: Date[] = []; // array of time stamps in milliseconds

    for (let j = 0; j < dataPoints; j++) {
        // random dates between Sep 12, 2016 and Sep 24, 2016
        domain.push(new Date(Math.floor(1473700105009 + Math.random() * 1000000000)));
    }

    for (let i = 0; i < seriesLength; i++) {
        const country = countries[Math.floor(Math.random() * countries.length)];
        const series: Series = {
            name: country.name,
            series: []
        };

        for (let j = 0; j < domain.length; j++) {
            const value = Math.floor(2000 + Math.random() * 5000);
            // let timestamp = Math.floor(1473700105009 + Math.random() * 1000000000);
            const timestamp = domain[j];
            if (includeMinMaxRange) {
                const errorMargin = 0.02 + Math.random() * 0.08;

                series.series.push({
                    value,
                    name: timestamp,
                    min: Math.floor(value * (1 - errorMargin)),
                    max: Math.ceil(value * (1 + errorMargin))
                });
            } else {
                series.series.push({
                    value,
                    name: timestamp
                });
            }
        }

        results.push(series);
    }
    return results;
}
