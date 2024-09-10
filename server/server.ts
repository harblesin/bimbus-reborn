import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import router from "./Routes";
import { initSocket } from "./socketHandler";

dotenv.config();
const app = express();
const PORT = process.env.NODE_SERVER_PORT;


function startServer(): Promise<void> {

    return new Promise<void>( async (resolve, reject) => {
        try{

            app.use(express.urlencoded({ extended: true, limit: '1mb' }));
            app.use(express.json({ limit: '1mb' }));
            
            app.use(express.static(path.join(__dirname, '../build')));
            app.use(express.static(path.join(__dirname + "../public")));
            
            app.use(router);
            
            app.get('*', (req, res) => {
                res.sendFile(path.join(__dirname, '../build', 'index.html'));
            });
            
            let server = app.listen(PORT, () => {
                const now = new Date();
                console.info(`${process.pid} | ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} | Server | Express server now running on port ${PORT}`);
            });
            initSocket(server);
            resolve();
        } catch (err) {
            console.log(`Error occurring starting http server: ${err}`);
            reject(err);
        }
        
    })
}

export default startServer;
