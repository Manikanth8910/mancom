export default () => ({
    port: parseInt(process.env.PORT || '3002', 10),
    host: process.env.HOST || '0.0.0.0',
    jwt: {
        publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem',
    },
});
