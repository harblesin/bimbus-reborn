import startServer from "./server/server";

startServer().catch((err: any) => {
    return console.log(`Error occurring starting http server: ${err}`);
});

