
import { PlacementTypes } from './placement-type.enum';

export const caretOffset = 7;

export function verticalPosition(elDimensions: DOMRect, popoverDimensions: DOMRect, alignment: PlacementTypes): number {
    if (alignment === PlacementTypes.Top) {
        return elDimensions.top - caretOffset;
    }

    if (alignment === PlacementTypes.Bottom) {
        return elDimensions.top + elDimensions.height - popoverDimensions.height + caretOffset;
    }

    if (alignment === PlacementTypes.Center) {
        return elDimensions.top + elDimensions.height / 2 - popoverDimensions.height / 2;
    }

    return undefined;
}

export function horizontalPosition(elDimensions: DOMRect, popoverDimensions: DOMRect, alignment: PlacementTypes): number {
    if (alignment === PlacementTypes.Left) {
        return elDimensions.left - caretOffset;
    }

    if (alignment === PlacementTypes.Right) {
        return elDimensions.left + elDimensions.width - popoverDimensions.width + caretOffset;
    }

    if (alignment === PlacementTypes.Center) {
        return elDimensions.left + elDimensions.width / 2 - popoverDimensions.width / 2;
    }

    return undefined;
}
