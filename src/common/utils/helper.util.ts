export const findClosestNextValue = (array: number[], target: number) => {
  let left = 0;
  let right = array.length - 1;
  let result = null;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (array[mid] <= target) {
      left = mid + 1;
    } else {
      result = array[mid];
      right = mid - 1;
    }
  }

  return result;
};

export const findNumberOrClosestNext = (array: number[], target: number) => {
  let left = 0;
  let right = array.length - 1;
  let result = null;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const current = array[mid];

    if (current === target) {
      return current;
    }
    if (current > target) {
      result = current;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return result;
};
