const ItemService = require('../services/item.service');
const upload = require('../middlewares/upload');

class ItemController {
    // Create a new item
    static createItem = [
        upload.single('image'),
        async (req, res) => {
            try {
                const { name, price, description, available, categoryId } = req.body;
                const image = req.file ? req.file.path : null; // Đường dẫn ảnh sau khi upload
                const newItem = await ItemService.createItem(name, price, image, description, available, categoryId);
                res.status(201).json(newItem);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
    ];

    // Get all items or get item by ID
    static async getItems(req, res) {
        try {
            const { id } = req.params;
            if (id) {
                const item = await ItemService.getItemById(id);
                if (item) {
                    res.status(200).json(item);
                } else {
                    res.status(404).json({ error: 'Item not found' });
                }
            } else {
                const items = await ItemService.getAllItems();
                res.status(200).json(items);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update item by ID
    static updateItem = [
        upload.single('image'), // Middleware xử lý upload ảnh
        async (req, res) => {
            try {
                const { id } = req.params;
                const { name, price, description, available, active, categoryId } = req.body;
                const image = req.file ? req.file.path : null; // Đường dẫn ảnh sau khi upload
                const updatedItem = await ItemService.updateItem(id, name, price, image, description, available, active, categoryId);
                if (updatedItem) {
                    res.status(200).json(updatedItem);
                } else {
                    res.status(404).json({ error: 'Item not found' });
                }
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
    ];

    // Delete item by ID
    static async deleteItem(req, res) {
        try {
            const { id } = req.params;
            const deletedItem = await ItemService.deleteItem(id);
            if (deletedItem) {
                res.status(200).json(deletedItem);
            } else {
                res.status(404).json({ error: 'Item not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ItemController;