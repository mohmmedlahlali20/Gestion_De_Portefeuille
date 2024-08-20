class TransactionService {
    constructor(db) {
        this.db = db;
    }

    async getTransactionsByUserId(userId) {
        return this.db.query(`
            SELECT 
                t.id, t.type, t.montant, t.date, t.user_id, c.name AS category_name
            FROM 
                Transaction t
            JOIN 
                Category c ON t.category_id = c.id
            WHERE 
                t.user_id = ?
        `, [userId]);
    }
    
    

    async getTransactionById(id) {
        const [transaction] = await this.db.query(`
            SELECT 
                t.id, t.type, t.montant, t.date, t.user_id, c.name AS category_name
            FROM 
                Transaction t
            JOIN 
                Category c ON t.category_id = c.id
            WHERE 
                t.id = ?
        `, [id]);
        return transaction;
    }

    async createTransaction(category_id, amount, type, date, user_id) {
        const validTypes = ['revenus', 'dépenses'];
        if (!validTypes.includes(type)) throw new Error('Invalid transaction type');

        return this.db.query(`
            INSERT INTO Transaction (type, montant, date, category_id, user_id)
            VALUES (?, ?, ?, ?, ?)
        `, [type, amount, date, category_id, user_id]);
    }

    async updateTransaction(id, type, montant, category_id) {
        return this.db.query('UPDATE Transaction SET type = ?, montant = ?, category_id = ? WHERE id = ?', [type, montant, category_id, id]);
    }
    async deleteTransaction(id) {
        return this.db.query('DELETE FROM Transaction WHERE id = ?', [id]);
    }
    
}

module.exports = TransactionService;
