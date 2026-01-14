export interface LinearGaugeOptions {
    min?: number;
    max?: number;
    value?: number;
    units?: string;
    previousValue?: number;
    valueFormatting?: (value: unknown) => string;
}
