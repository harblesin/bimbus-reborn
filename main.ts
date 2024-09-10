import startServer from "./server/server";
import startBot from "./bot/bot";

startServer().then( () => {
    startBot();
}).catch(err => {
    return console.log(`Error occurring starting http server: ${err}`);
});

