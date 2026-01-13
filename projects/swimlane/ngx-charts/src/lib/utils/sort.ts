export function sortLinear<T>(data: T[], property: string, direction = 'asc'): T[] {
  return data.sort((a, b) => {
    if (direction === 'asc') {
      return a[property] - b[property];
    } else {
      return b[property] - a[property];
    }
  });
}

export function sortByDomain<T>(data: T[], property: string, direction = 'asc', domain: unknown[]): T[] {
  return data.sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];

    const aIdx = domain.indexOf(aVal);
    const bIdx = domain.indexOf(bVal);

    if (direction === 'asc') {
      return aIdx - bIdx;
    } else {
      return bIdx - aIdx;
    }
  });
}

export function sortByTime<T>(data: T[], property: string, direction = 'asc'): T[] {
  return data.sort((a, b) => {
    const aDate = a[property].getTime();
    const bDate = b[property].getTime();

    if (direction === 'asc') {
      if (aDate > bDate) return 1;
      if (bDate > aDate) return -1;
      return 0;
    } else {
      if (aDate > bDate) return -1;
      if (bDate > aDate) return 1;
      return 0;
    }
  });
}
