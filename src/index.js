
import app from "./app.js";
import connectDB from "./db/index.js";
import 'dotenv/config'

connectDB()
.then(() => {
    const PORT =process.env.PORT || 8000
    app.on("error", (error) => {
        console.log("Error: ", error);
        throw new Error("Error", error);
    })
    app.listen(PORT, () => {
        console.log("Server is running at port: ", PORT);
    });

    app.get("/", (req,res) =>{
        
        res.send("this is a test request")
    })
})
.catch(error => {
    console.log("MongoDB connection failed !!! ", error);
})






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