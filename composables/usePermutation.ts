/**
 * Helpers for working with permutation order.
 *
 * Muc dich:
 * - Chi dung 1 file de xu ly thu tu hoan vi.
 * - Ma hoa thu tu hien tai thanh `seed`.
 * - Giai ma `seed` de khoi phuc lai danh sach theo dung thu tu da luu.
 * - Ho tro xao tron nhanh danh sach khi can demo hoac tao thu tu moi.
 *
 * 3 ham public:
 * - `encodePermutation(sourceItems, orderedItems)`
 * - `decodePermutation(sourceItems, seed)`
 * - `shuffleItems(items)`
 *
 * Cach dung:
 *
 * ```ts
 * import {
 *   decodePermutation,
 *   encodePermutation,
 *   shuffleItems,
 * } from "~/composables/usePermutation";
 *
 * const sourceItems = ["A", "B", "C", "D"];
 * const orderedItems = ["C", "A", "D", "B"];
 *
 * const seed = encodePermutation(sourceItems, orderedItems);
 * const restoredItems = decodePermutation(sourceItems, seed);
 * const randomItems = shuffleItems(sourceItems);
 * ```
 *
 * Dieu kien:
 * - `sourceItems` phai la danh sach goc co thu tu on dinh.
 * - `orderedItems` phai la mot hoan vi hop le cua `sourceItems`.
 * - Neu danh sach goc thay doi, `seed` cu co the khong con khoi phuc dung.
 */

export function encodePermutation<T>(sourceItems: T[], orderedItems: T[]) {
  const permutation = getPermutationIndexes(sourceItems, orderedItems);
  const lehmerDigits = permutationToLehmerDigits(permutation);
  return lehmerDigitsToSeed(lehmerDigits);
}

export function decodePermutation<T>(sourceItems: T[], seed: string) {
  const permutation = lehmerDigitsToPermutation(seedToLehmerDigits(seed, sourceItems.length));

  return permutation
    .map(index => sourceItems[index])
    .filter((item): item is T => item !== undefined);
}

export function shuffleItems<T>(items: T[]) {
  const randomizedItems = [...items];

  for (let index = randomizedItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [randomizedItems[index], randomizedItems[randomIndex]] = [randomizedItems[randomIndex], randomizedItems[index]];
  }

  return randomizedItems;
}

function getPermutationIndexes<T>(sourceItems: T[], orderedItems: T[]) {
  const sourceIndexMap = new Map(sourceItems.map((item, index) => [item, index]));

  return orderedItems
    .map(item => sourceIndexMap.get(item))
    .filter((index): index is number => Number.isInteger(index));
}

function permutationToLehmerDigits(permutation: number[]) {
  const availableIndexes = Array.from({ length: permutation.length }, (_, index) => index);

  return permutation.map(index => {
    const digit = availableIndexes.indexOf(index);
    availableIndexes.splice(digit, 1);
    return digit;
  });
}

function lehmerDigitsToSeed(digits: number[]) {
  if (!digits.length) return "0";

  let value = 0n;

  digits.forEach((digit, index) => {
    const base = factorialBigInt(digits.length - index - 1);
    value += BigInt(digit) * base;
  });

  return value.toString(36);
}

function seedToLehmerDigits(seed: string, size: number) {
  if (!seed || size <= 0) return [];

  let remainingValue = base36ToBigInt(seed);
  const digits = [];

  for (let index = 0; index < size; index += 1) {
    const base = factorialBigInt(size - index - 1);
    const digit = remainingValue / base;
    digits.push(Number(digit));
    remainingValue %= base;
  }

  return digits;
}

function lehmerDigitsToPermutation(digits: number[]) {
  const availableIndexes = Array.from({ length: digits.length }, (_, index) => index);

  return digits.map(digit => {
    const selectedIndex = availableIndexes[digit];
    availableIndexes.splice(digit, 1);
    return selectedIndex;
  });
}

function factorialBigInt(number: number) {
  let result = 1n;

  for (let index = 2; index <= number; index += 1) {
    result *= BigInt(index);
  }

  return result;
}

function base36ToBigInt(value: string) {
  const normalizedValue = value.toLowerCase();
  let result = 0n;

  for (const char of normalizedValue) {
    const digit = BigInt(parseInt(char, 36));
    result = result * 36n + digit;
  }

  return result;
}
