
export function calculateActiveEntries(event, group, results, activeEntries, fromLegend: boolean = false): {
    activeEntries: any[];
    item: any;
} {
    const item = Object.assign({}, event);
    if (group) {
        item.series = group.name;
    }

    const items = results
        .map(g => g.series)
        .flat()
        .filter(i => {
            if (fromLegend) {
                return i.label === item.name;
            } else {
                return i.name === item.name && i.series === item.series;
            }
        });

    return {
        activeEntries: [...items],
        item
    };
}

export function calculateDeactivatedEntries(event, group, activeEntries, fromLegend: boolean = false): {
    activeEntries: any[];
    item: any;
} {
    const item = Object.assign({}, event);
    if (group) {
        item.series = group.name;
    }

    const filtered = (activeEntries as unknown as { name: string; series: unknown; label: string }[]).filter(
        i => {
            if (fromLegend) {
                return i.label !== item.name;
            } else {
                return !(i.name === item.name && i.series === item.series);
            }
        }
    );

    return {
        activeEntries: filtered,
        item
    };
}
