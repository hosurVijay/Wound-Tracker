import { connectionInstance as db } from "../db/index.js";

const createUser = async (name, email, password, phoneNumber, dob) => {
    try {
            const query = `
        INSERT INTO users
        (name, email, password_hashed, phoneNumber, date_of_birth)
        VALUES(?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(
        query,
        [name, email, password, phoneNumber, dob]
    );

    return result
    } catch (error) {
        console.log("Creation of  user operation failed")
        throw error
    }
}

const findUserByEmail = async (email) => {
    try {
        const query = `
        SELECT *
        FROM users
        WHERE email = ?
    `;

    const [res] = await db.execute(
        query,
        [email]
    )

    return res;
    } catch (error) {
        console.log("find user by email failed")
        throw error
    }
}

const findUserById = async (id) => {
    const query = `
        SELECT *
        FROM users
        where id = ?
    `;

    const [res] = await db.execute(
        query,
        [id]
    )

    return res;
}

const updateUser = async(id, name, phoneNumber, dob) => {
    const query = `
        UPDATE users 
        SET 
            name = ?,
            phoneNumber = ?,
            date_of_birth = ?,
        Where Id = ? ,
    `;
    const [res] = await db.execute(
        query,
        [name, phoneNumber, dob, id]
    )

    return res
}

const deleteUser = async (id) => {
    const query = `
        DELETE FROM users
        WHERE id = ?
    `

    const [res] = await db.execute(
        query,
        [id]
    )

    return res
}

const updateProfileImage = async(profileImageUrl ,email) =>{
    const query = `
        UPDATE users
        SET
            profileImage = ?,
        WHERE email = ?
    `;

    const [res] = await db.execute(
        query,
        [profileImageUrl, email]
    )

    return res

}

const updatePassword = async(password, userId) => {
    const query = `
        UPDATE users
            SET password_hashed = ?
        where id = ?
    `;

    const [result] = await db.execute(
        query,
        [password, userId]
    )

    return result
}


export {
    updateProfileImage,
    findUserByEmail,
    findUserById,
    updateUser,
    deleteUser,
    createUser,
    updatePassword
}