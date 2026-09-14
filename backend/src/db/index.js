import mysql from 'mysql2'
const connectionInstance = mysql.createConnection({
        host: 'localhost',
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
        password : process.env.DB_PASSWORD
    })

const db = connectionInstance.promise();

const connectDb = async() => {
    try {  
    connectionInstance.connect((err) => {
        if (!err) {
        console.log("mysql connection succesfully")
        }else{
            console.log("connection error MYSQL", err)
        }
    })
    
    return connectionInstance
    } catch (error) {
        console.log("connection with mysql failed! Try again", error);
        process.exit(1)
    }
}

export {connectDb, db}
