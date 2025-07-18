import bcrypt from 'bcrypt';

export const hashPassword = async (
  plainPassword: string,
  saltRounds: string | number = 10,
) => {
  try {
    return bcrypt.hashSync(plainPassword, saltRounds);
  } catch (error) {
    console.log('error: ', error);
  }
};

export const comparePassword = async (
  plainPassword: string,
  hashPassword: string,
) => {
  try {
    return bcrypt.compareSync(plainPassword, hashPassword);
  } catch (error) {
    console.log(error);
  }
};
