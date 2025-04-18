// __tests__/lib/hash.test.js

// 1) mock out bcryptjs so we can control its behavior
import bcrypt from 'bcryptjs';
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

// 2) import the functions under test
import { hashPassword, comparePassword } from '../../lib/hash';

describe('hashPassword', () => {
  it('generates a salt with cost 10 and hashes the password', async () => {
    // arrange
    const fakeSalt = 'salt123';
    const fakeHash = 'hashedPassword';
    bcrypt.genSalt.mockResolvedValue(fakeSalt);
    bcrypt.hash.mockResolvedValue(fakeHash);

    // act
    const result = await hashPassword('myPassword');

    // assert
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);                      // used cost factor 10
    expect(bcrypt.hash).toHaveBeenCalledWith('myPassword', fakeSalt);     // passed the salt to hash()
    expect(result).toBe(fakeHash);                                        // returned the hash
  });
});

describe('comparePassword', () => {
  it('calls bcrypt.compare and returns its result (true case)', async () => {
    // arrange
    bcrypt.compare.mockResolvedValue(true);

    // act
    const isMatch = await comparePassword('plainPwd', 'hashedPwd');

    // assert
    expect(bcrypt.compare).toHaveBeenCalledWith('plainPwd', 'hashedPwd');
    expect(isMatch).toBe(true);
  });

  it('returns false when bcrypt.compare resolves to false', async () => {
    // arrange
    bcrypt.compare.mockResolvedValue(false);

    // act
    const isMatch = await comparePassword('wrongPwd', 'hashedPwd');

    // assert
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongPwd', 'hashedPwd');
    expect(isMatch).toBe(false);
  });
});
