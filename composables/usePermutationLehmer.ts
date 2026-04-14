/**
 * Composable helpers for encoding and decoding permutation order with Lehmer code.
 *
 * Muc dich:
 * - Khong can luu lai ca mang da xao.
 * - Chi luu `seed` dai dien cho thu tu hoan vi.
 * - Khi can khoi phuc, dung lai danh sach goc + `seed`.
 *
 * Nguyen ly:
 * 1. Tu `sourceItems` va `orderedItems`, ta suy ra permutation index.
 *    Vi du:
 *    sourceItems  = [A, B, C, D]
 *    orderedItems = [C, A, D, B]
 *    permutation  = [2, 0, 3, 1]
 *
 * 2. Chuyen permutation thanh Lehmer digits.
 *
 * 3. Chuyen Lehmer digits thanh mot so duy nhat.
 *
 * 4. Doi so do thanh chuoi base36 de luu gon hon.
 *
 * Dieu kien quan trong:
 * - `sourceItems` phai la danh sach goc co thu tu on dinh.
 * - Neu thu tu goc thay doi thi `seed` cu se khong giai ma dung nua.
 * - `orderedItems` phai la mot hoan vi cua `sourceItems`.
 *
 * Cach dung nhanh:
 *
 * ```ts
 * import {
 *   decodePermutationLehmer,
 *   encodePermutationLehmer,
 *   getPermutationIndexes,
 * } from "~/composables/usePermutationLehmer";
 *
 * const sourceItems = ["A", "B", "C", "D"];
 * const orderedItems = ["C", "A", "D", "B"];
 *
 * const seed = encodePermutationLehmer(sourceItems, orderedItems);
 * // Vi du: "f"
 *
 * const restoredItems = decodePermutationLehmer(sourceItems, seed);
 * // ["C", "A", "D", "B"]
 *
 * const permutation = getPermutationIndexes(sourceItems, orderedItems);
 * // [2, 0, 3, 1]
 * ```
 *
 * Truong hop phu hop:
 * - Luu thu tu de thi da xao dua tren ngan hang cau hoi goc.
 * - Luu vi tri hoan vi ma khong muon luu lai ca mang ket qua.
 *
 * Truong hop khong phu hop:
 * - Khi ban muon khoi phuc du lieu nhung khong con danh sach goc.
 * - Khi danh sach goc co the bi them/bot/sap xep lai sau khi tao seed.
 */

export function getPermutationIndexes<T>(sourceItems: T[], orderedItems: T[]) {
  const sourceIndexMap = new Map(sourceItems.map((item, index) => [item, index]));

  return orderedItems
    .map(item => sourceIndexMap.get(item))
    .filter((index): index is number => Number.isInteger(index));
}

/**
 * Encode thu tu `orderedItems` thanh seed Lehmer dua tren `sourceItems`.
 *
 * Dau vao:
 * - `sourceItems`: danh sach goc, thu tu chuan
 * - `orderedItems`: danh sach da duoc xao tu `sourceItems`
 *
 * Dau ra:
 * - Chuoi `seed` base36
 *
 * Vi du:
 * ```ts
 * const seed = encodePermutationLehmer(
 *   ["A", "B", "C", "D"],
 *   ["C", "A", "D", "B"],
 * );
 * ```
 */
export function encodePermutationLehmer<T>(sourceItems: T[], orderedItems: T[]) {
  const permutation = getPermutationIndexes(sourceItems, orderedItems);
  const lehmerDigits = permutationToLehmerDigits(permutation);
  return lehmerDigitsToSeed(lehmerDigits);
}

/**
 * Decode `seed` Lehmer thanh lai danh sach da xao dua tren `sourceItems`.
 *
 * Dau vao:
 * - `sourceItems`: danh sach goc
 * - `seed`: chuoi seed da tao boi `encodePermutationLehmer`
 *
 * Dau ra:
 * - Danh sach da duoc khoi phuc theo dung thu tu hoan vi
 *
 * Vi du:
 * ```ts
 * const restored = decodePermutationLehmer(
 *   ["A", "B", "C", "D"],
 *   "f",
 * );
 * ```
 */
export function decodePermutationLehmer<T>(sourceItems: T[], seed: string) {
  const permutation = lehmerDigitsToPermutation(seedToLehmerDigits(seed, sourceItems.length));

  return permutation
    .map(index => sourceItems[index])
    .filter((item): item is T => item !== undefined);
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

function factorial(number: number) {
  if (number <= 1) return 1;

  let result = 1;

  for (let index = 2; index <= number; index += 1) {
    result *= index;
  }

  return result;
}

function factorialBigInt(number: number) {
  return BigInt(factorial(number));
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
