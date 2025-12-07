import * as bcrypt from 'bcrypt';

// export async function generateHash(plaintext: string): Promise<string> {
//   return await bcrypt.hash(
//     plaintext,
//     parseInt(process.env.SALT_ROUNDS || '10'),
//   );
// }
export async function generateHash(plaintext: string): Promise<string> {
  try {
    return await bcrypt.hash(
      plaintext,
      parseInt(process.env.SALT_ROUNDS || '10'),
    );
  } catch (error) {
    throw new Error('Error generating password hash');
  }
}

export const comparePassword = async (
  plaintext: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(plaintext, hashedPassword);
};
