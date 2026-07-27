import cors from 'cors'
import express from 'express'

const app = express()
app.use(cors({
    credentials: true,
    origin: "*"
}))
app.use(express.urlencoded({limit: "16kb"}));
app.use(express.json({limit: "16kb"}))

export {app}