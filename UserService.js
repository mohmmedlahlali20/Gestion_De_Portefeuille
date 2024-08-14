const bcrypt = require('bcrypt');

class UserService {
    constructor(db) {
        this.db = db;
    }

    async getAllUsers() {
        return this.db.query('SELECT * FROM User');
    }

    async registerUser(email, name, password) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        try {
            return await this.db.query('INSERT INTO User (email, name, password) VALUES (?, ?, ?)', [email, name, hashedPassword]);
        } catch (err) {
            throw new Error('Error registering user: ' + err.message);
        }
    }

    async authenticateUser(email, password) {
        try {
            const results = await this.db.query('SELECT * FROM User WHERE email = ?', [email]);
            if (results.length === 0) throw new Error('User not found');
            const user = results[0];
            const isPasswordValid = bcrypt.compareSync(password, user.password);
            if (!isPasswordValid) throw new Error('Invalid password');
            return user;
        } catch (err) {
            throw new Error('Error authenticating user: ' + err.message);
        }
    }
}

module.exports = UserService;
