import * as bcrypt from 'bcrypt';

export async function generateHash(plaintext: string): Promise<string> {
  return await bcrypt.hash(
    plaintext,
    parseInt(process.env.SALT_ROUNDS || '10'),
  );
}

export const comparePassword = async (
  plaintext: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(plaintext, hashedPassword);
};
