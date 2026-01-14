export interface RectItem {
    fill: string;
    height: number;
    rx: number;
    width: number;
    x: number;
    y: number;
}

export function getHeatMapDomains(results: any[]): { xDomain: string[]; yDomain: string[]; valueDomain: number[] } {
    const xDomain = [];
    const yDomain = [];
    const valueDomain = [];

    for (const group of results) {
        if (!xDomain.includes(group.name)) {
            xDomain.push(group.name);
        }
        for (const d of group.series) {
            if (!yDomain.includes(d.name)) {
                yDomain.push(d.name);
            }
            if (!valueDomain.includes(d.value)) {
                valueDomain.push(d.value);
            }
        }
    }

    return { xDomain, yDomain, valueDomain };
}

export function getHeatMapRects(xDomain: string[], yDomain: string[], xScale: any, yScale: any): RectItem[] {
    const rects = [];

    xDomain.map(xVal => {
        yDomain.map(yVal => {
            rects.push({
                x: xScale(xVal),
                y: yScale(yVal),
                rx: 3,
                width: xScale.bandwidth(),
                height: yScale.bandwidth(),
                fill: 'rgba(200,200,200,0.03)'
            });
        });
    });

    return rects;
}
