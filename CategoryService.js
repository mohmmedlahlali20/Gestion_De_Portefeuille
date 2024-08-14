class CategoryService {
    constructor(db) {
        this.db = db;
    }

    async getAllCategories() {
        return this.db.query('SELECT * FROM Category');
    }

    async createCategory(name) {
        return this.db.query('INSERT INTO Category (name) VALUES (?)', [name]);
    }

    async updateCategory(id, name) {
        return this.db.query('UPDATE Category SET name = ? WHERE id = ?', [name, id]);
    }
    

    async deleteCategory(id) {
        return this.db.query('DELETE FROM Category WHERE id = ?', [id]);
    }
}


module.exports = CategoryService;