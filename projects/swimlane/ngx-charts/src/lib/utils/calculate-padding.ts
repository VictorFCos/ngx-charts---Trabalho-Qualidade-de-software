export function calculateInnerPadding(value: string | number | Array<string | number>, index: number = 0, N: number, L: number): number {
    if (typeof value === 'string') {
        value = value
            .replace('[', '')
            .replace(']', '')
            .replace('px', '')
            .replace("'", '');

        if (value.includes(',')) {
            value = value.split(',');
        }
    }
    if (Array.isArray(value) && typeof index === 'number') {
        return calculateInnerPadding(value[index], null, N, L);
    }
    if (typeof value === 'string' && value.includes('%')) {
        return +value.replace('%', '') / 100;
    }
    return N / (L / +value + 1);
}
