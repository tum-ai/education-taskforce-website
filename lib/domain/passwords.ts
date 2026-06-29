const LOWER = "abcdefghijkmnopqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%";
const ALL = `${LOWER}${UPPER}${DIGITS}${SYMBOLS}`;

function getRandomIndex(length: number): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % length;
}

function pick(source: string): string {
  return source[getRandomIndex(source.length)];
}

export function generateTemporaryPassword(length = 14): string {
  const safeLength = Math.max(length, 12);
  const required = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SYMBOLS)];
  const rest = Array.from({ length: safeLength - required.length }, () => pick(ALL));
  const chars = [...required, ...rest];

  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = getRandomIndex(index + 1);
    [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
  }

  return chars.join("");
}

export function passwordMeetsTemporaryPolicy(password: string): boolean {
  return (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%]/.test(password)
  );
}
