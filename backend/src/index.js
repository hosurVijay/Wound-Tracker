import dotenv from 'dotenv'
import { connectDb } from './db/index.js'
import {app} from "./app.js"
dotenv.config({
    path: "./.env",    
})
const port =  `${process.env.PORT}` || 8000 
connectDb()
    .then(() => {
        app.listen(port, () => {
            console.log("Server is live and hot on port", port)
        })
    })
    .catch((err) => {
        console.log("Server failed to start try Again", err)
    })
    