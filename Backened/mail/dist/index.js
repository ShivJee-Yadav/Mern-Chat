import express from 'express';
import { startSendOtpConsumer } from './consumer.js';
import dotenv from 'dotenv';
dotenv.config();
startSendOtpConsumer();
console.log("working Correctlty");
const app = express();
app.listen(process.env.PORT, () => {
    console.log(`server is running on psort ${process.env.PORT}`);
});
//# sourceMappingURL=index.js.map