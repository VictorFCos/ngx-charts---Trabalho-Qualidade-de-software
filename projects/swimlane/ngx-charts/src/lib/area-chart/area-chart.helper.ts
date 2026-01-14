
import { scaleLinear, scalePoint, scaleTime } from 'd3-scale';
import { getUniqueXDomainValues, getScaleType } from '../common/domain.helper';
import { isDate, isNumber } from '../utils/types';
import { ScaleType } from '../common/types/scale-type.enum';

export function getAreaChartXDomain(
    results: any[],
    xScaleMin: any,
    xScaleMax: any
): { domain: any[]; scaleType: ScaleType; xSet: any[] } {
    let values = getUniqueXDomainValues(results);
    const scaleType = getScaleType(values);
    let domain = [];
    let xSet = [];

    if (scaleType === ScaleType.Linear) {
        values = values.map(v => Number(v));
    }

    let min;
    let max;
    if (scaleType === ScaleType.Time || scaleType === ScaleType.Linear) {
        min = xScaleMin ? xScaleMin : Math.min(...values);
        max = xScaleMax ? xScaleMax : Math.max(...values);
    }

    if (scaleType === ScaleType.Time) {
        domain = [new Date(min), new Date(max)];
        xSet = [...values].sort((a, b) => {
            const aDate = a.getTime();
            const bDate = b.getTime();
            if (aDate > bDate) return 1;
            if (bDate > aDate) return -1;
            return 0;
        });
    } else if (scaleType === ScaleType.Linear) {
        domain = [min, max];
        xSet = [...values].sort((a, b) => a - b);
    } else {
        domain = values;
        xSet = values;
    }

    return { domain, scaleType, xSet };
}

export function getAreaChartYDomain(
    results: any[],
    autoScale: boolean,
    yScaleMin: number,
    yScaleMax: number,
    baseValue: number | 'auto' = 'auto'
): [number, number] {
    const domain = [];

    for (const group of results) {
        for (const d of group.series) {
            if (!domain.includes(d.value)) {
                domain.push(d.value);
            }
        }
    }

    const values = [...domain];
    if (!autoScale) {
        values.push(0);
    }
    if (baseValue !== 'auto') {
        values.push(baseValue);
    }

    const min = yScaleMin ? yScaleMin : Math.min(...values);
    const max = yScaleMax ? yScaleMax : Math.max(...values);

    return [min, max];
}

export function getAreaChartXScale(
    domain: any[],
    width: number,
    scaleType: ScaleType,
    roundDomains: boolean
): any {
    let scale;

    if (scaleType === ScaleType.Time) {
        scale = scaleTime();
    } else if (scaleType === ScaleType.Linear) {
        scale = scaleLinear();
    } else if (scaleType === ScaleType.Ordinal) {
        scale = scalePoint().padding(0.1);
    }

    scale.range([0, width]).domain(domain);

    return roundDomains ? scale.nice() : scale;
}

export function getAreaChartYScale(
    domain: [number, number],
    height: number,
    roundDomains: boolean
): any {
    const scale = scaleLinear().range([height, 0]).domain(domain);
    return roundDomains ? scale.nice() : scale;
}
