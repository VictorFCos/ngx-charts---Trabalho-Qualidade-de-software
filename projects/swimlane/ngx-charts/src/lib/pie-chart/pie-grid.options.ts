export interface PieGridOptions {
    designatedTotal?: number;
    tooltipDisabled?: boolean;
    tooltipText?: (o: unknown) => string;
    label?: string;
    minWidth?: number;
    activeEntries?: unknown[];
}
