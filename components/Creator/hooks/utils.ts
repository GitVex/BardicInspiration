export const validateUrl = (url: string) => {
    const re = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return re.test(url);
};