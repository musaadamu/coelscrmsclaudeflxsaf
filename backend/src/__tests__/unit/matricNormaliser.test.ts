import { normaliseMatricNumber, MatricNormaliseError } from '../../../src/utils/matricNormaliser';

describe('Matric Normaliser', () => {
  it('should pass correct formats unchanged', () => {
    expect(normaliseMatricNumber('COELS/NCE/2024/001')).toBe('COELS/NCE/2024/001');
  });

  it('should normalise compact formats', () => {
    expect(normaliseMatricNumber('NCE24001')).toBe('COELS/NCE/2024/001');
    expect(normaliseMatricNumber('COELSNCE2024001')).toBe('COELS/NCE/2024/001');
  });

  it('should normalise dashed or dotted formats', () => {
    expect(normaliseMatricNumber('coels-nce-2024-001')).toBe('COELS/NCE/2024/001');
    expect(normaliseMatricNumber('COELS.NCE.2024.1')).toBe('COELS/NCE/2024/001');
  });

  it('should normalise missing prefixes', () => {
    expect(normaliseMatricNumber('NCE/2024/001')).toBe('COELS/NCE/2024/001');
    expect(normaliseMatricNumber('NCE/24/1')).toBe('COELS/NCE/2024/001');
  });

  it('should map programme codes correctly', () => {
    expect(normaliseMatricNumber('DIPLOMA/2023/042')).toBe('COELS/DIP/2023/042');
    expect(normaliseMatricNumber('PTNCE23005')).toBe('COELS/PTNCE/2023/005');
  });

  it('should throw MatricNormaliseError for unrecognisable formats', () => {
    expect(() => normaliseMatricNumber('INVALIDSTRING123')).toThrow(MatricNormaliseError);
    expect(() => normaliseMatricNumber('COELS/INVALID/FORMAT')).toThrow(MatricNormaliseError);
  });
});
