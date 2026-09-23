import mysql from "mysql2";
const connectionInstance = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

const db = connectionInstance.promise();

const connectDb = async () => {
  try {
    connectionInstance.connect((err) => {
      if (!err) {
        console.log("mysql connection succesfully");
      } else {
        console.log("connection error MYSQL", err);
      }
    });

    return connectionInstance;
  } catch (error) {
    console.log("connection with mysql failed! Try again", error);
    process.exit(1);
  }
};

const beginTransaction = async () => {
  await db.beginTransaction();
};

const commitTransaction = async () => {
  await db.commit();
};

const rollBackTransaction = async () => {
  await db.rollback();
};

export {
  connectDb,
  db,
  beginTransaction,
  commitTransaction,
  rollBackTransaction,
};
