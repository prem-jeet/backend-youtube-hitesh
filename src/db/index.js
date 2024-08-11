import { connect } from "mongoose"
import { DB_NAME } from "../constants.js"
const connectDB = async () => {
    try {
        const URI = `${process.env.MONGODB_URI}/${DB_NAME}`;
        // console.log(URI);
        const connectionInstance = await connect(URI);
        console.log(`\nMongoDB conneted... !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection Error: ', error);
        throw error
    }
}
export default connectDB;