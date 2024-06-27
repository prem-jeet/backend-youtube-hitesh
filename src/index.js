import { connect } from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";




/*
const app = express();

(async () => {
    try {
        await connect(`${process.env.MONGODB_UI}/${DB_NAME}`)

        app.on("error", (error) => {
            console.log("Error: ", error);
            throw new Error("Error", error);
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is running on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("Error: ", error);
        throw new Error("Error", error);
    }
})()
*/