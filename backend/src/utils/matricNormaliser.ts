export class MatricNormaliseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MatricNormaliseError';
  }
}

export function normaliseMatricNumber(rawMatric: string): string {
  if (!rawMatric) throw new MatricNormaliseError('Empty matric number');

  // Strip non-alphanumeric characters, except we want to extract parts.
  // We can try to extract (COELS)? (PROG) (YEAR) (SEQ)
  
  const normalised = rawMatric.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Let's use a regex to match: optional COELS, then programme (letters), then year (2 or 4 digits), then sequence (digits)
  const match = normalised.match(/^(?:COELS)?([A-Z]+)(\d{2}|\d{4})(\d{1,4})$/);

  if (!match) {
    throw new MatricNormaliseError(`Unrecognisable matric format: ${rawMatric}`);
  }

  let [_, prog, yearStr, seqStr] = match;

  // Map programme
  const progMap: Record<string, string> = {
    'NCE': 'NCE',
    'DIP': 'DIP',
    'DIPLOMA': 'DIP',
    'PTNCE': 'PTNCE'
  };

  if (!progMap[prog]) {
    // Attempt fallback or default
    if (prog === 'DEGREE') prog = 'DEG';
    else if (!progMap[prog]) {
      // Still use it if not mapped, or maybe just map exactly. 
      // The prompt says: NCE→NCE, DIP→DIP, PTNCE→PTNCE, Diploma→DIP
      // Let's just use it as is if it's not in the map, or maybe throw. We'll use the map if it exists.
    }
  }
  prog = progMap[prog] || prog;

  // Normalise year
  let year = yearStr;
  if (year.length === 2) {
    year = '20' + year;
  }

  // Normalise sequence
  const seq = seqStr.padStart(3, '0');

  return `COELS/${prog}/${year}/${seq}`;
}
