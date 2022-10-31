import { config } from "dotenv";
// configure dotenv
config();


export default () => ({
    port: process.env.PORT || 5000,
    domain: process.env.DOMAIN,
    paystackPublicKey: process.env.PAYSTACT_PUBLIC_KEY,
    paystackSecretKey: process.env.PAYSTACT_SECRET_KEY,
    database: {
        host: process.env.MONGODB_URI,
    },    
});