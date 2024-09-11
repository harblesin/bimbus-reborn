import startServer from "./server/server";

startServer().catch(() => {
    // return console.log(`Error occurring starting http server: ${err}`);
});

