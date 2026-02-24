const { getPool, sql } = require('../shared/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async function (context, req) {
    context.log('Auth Login Triggered');

    const { email, password } = req.body;

    if (!email || !password) {
        context.res = {
            status: 400,
            body: { message: "Missing required fields" }
        };
        return;
    }

    try {
        const pool = await getPool();

        // MOCK MODE: Return mock token if pool is null
        if (!pool) {
            context.log("Running in Mock Mode (No DB Configured)");
            const mockToken = jwt.sign({ userId: 1, email, isAdmin: false }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
            context.res = {
                status: 200,
                body: {
                    message: "Login successful (Mock)",
                    token: mockToken,
                    user: { id: 1, email, fullName: "Mock User", isAdmin: false }
                }
            };
            return;
        }

        // REAL LOGIC (Commented out/Active if DB connected)
        
        // 1. Find User by Email
        const request = pool.request();
        request.input('email', sql.NVarChar, email);
        const userResult = await request.query('SELECT UserID, FullName, PasswordHash, IsAdmin FROM Users WHERE Email = @email');

        if (userResult.recordset.length === 0) {
            context.res = { status: 401, body: { message: "Invalid email or password" } };
            return;
        }

        const user = userResult.recordset[0];

        // 2. Validate Password
        const isValid = await bcrypt.compare(password, user.PasswordHash);
        if (!isValid) {
            context.res = { status: 401, body: { message: "Invalid email or password" } };
            return;
        }

        // 3. Generate Token
        const token = jwt.sign(
            { userId: user.UserID, email, isAdmin: user.IsAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        context.res = {
            status: 200,
            body: {
                message: "Login successful",
                token,
                user: { id: user.UserID, fullName: user.FullName, email, isAdmin: user.IsAdmin }
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
