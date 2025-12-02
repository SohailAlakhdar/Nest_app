export const generateOTP = ():string => {
    return String(Math.floor(1000 + Math.random() * 9000));
};
