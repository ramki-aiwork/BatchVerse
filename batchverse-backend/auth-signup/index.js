const { getPool, sql } = require('../shared/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async function (context, req) {
    context.log('Auth Signup Triggered');

    const { email, password, fullName, batchYear } = req.body;

    if (!email || !password || !fullName || !batchYear) {
        context.res = {
            status: 400,
            body: { message: "Missing required fields" }
        };
        return;
    }

    try {
        const pool = await getPool();

        // MOCK MODE: If pool is null (env vars not set), return success mock
        if (!pool) {
            context.log("Running in Mock Mode (No DB Configured)");
            const mockToken = jwt.sign({ userId: 1, email, fullName, batchYear, isAdmin: false }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
            context.res = {
                status: 201,
                body: {
                    message: "User created (Mock)",
                    token: mockToken,
                    user: { id: 1, email, fullName, batchYear, isAdmin: false }
                }
            };
            return;
        }

        // REAL LOGIC (Commented out/Active if DB connected)
        
        // 1. Check if user exists
        const request = pool.request();
        request.input('email', sql.NVarChar, email);
        const existingUser = await request.query('SELECT TOP 1 UserID FROM Users WHERE Email = @email');
        
        if (existingUser.recordset.length > 0) {
            context.res = { status: 409, body: { message: "Email already exists" } };
            return;
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Insert User
        const insertRequest = pool.request();
        insertRequest.input('email', sql.NVarChar, email);
        insertRequest.input('passwordHash', sql.NVarChar, passwordHash);
        insertRequest.input('fullName', sql.NVarChar, fullName);
        insertRequest.input('batchYear', sql.Int, batchYear);

        // Using OUTPUT inserted.UserID to get the ID back immediately
        const result = await insertRequest.query(`
            INSERT INTO Users (Email, PasswordHash, FullName, BatchYear, IsAdmin)
            OUTPUT inserted.UserID
            VALUES (@email, @passwordHash, @fullName, @batchYear, 0)
        `);

        const newUserId = result.recordset[0].UserID;

        // 4. Generate Token
        const token = jwt.sign(
            { userId: newUserId, email, isAdmin: false },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        context.res = {
            status: 201,
            body: {
                message: "User created successfully",
                token,
                user: { id: newUserId, email, fullName, batchYear, isAdmin: false }
            }
        };

    } catch (err) {
        context.log.error(err);
        context.res = {
            status: 500,
            body: { message: "Internal Server Error" }
        };
    }
};
