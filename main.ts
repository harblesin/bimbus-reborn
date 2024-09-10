import startServer from "./server/server";

startServer().catch(err => {
    return console.log(`Error occurring starting http server: ${err}`);
});

