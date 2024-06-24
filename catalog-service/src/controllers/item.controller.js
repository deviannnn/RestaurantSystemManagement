const ItemService = require('../services/item.service');
const upload = require('../middlewares/upload');
const connectRedis = require('../config/redis');

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

    static async toggleAvailable(req, res) {
        try {
            const { id } = req.params;
            const { available } = req.body;

            const toggledItem = await ItemService.updateItem({ id, available });
            if (toggledItem) {
                res.status(200).json(toggledItem);
            } else {
                res.status(404).json({ error: 'Item not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getItemsByCategories(req, res) {
        try {
            const { categoryId } = req.params;
            const client = await connectRedis();

            const getItemInRedis = await client.get(`items:category:${categoryId}`);
            if (getItemInRedis) {
                res.status(200).json(JSON.parse(getItemInRedis));
            }
            else {
                const menu = await ItemService.getAllItemsByCaterogies(categoryId);
                await client.set(`items:category:${categoryId}`, JSON.stringify(menu), 'EX', 3600);
                return res.status(300).json(menu);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    // Get all items or get item by ID
    static async getItems(req, res) {
        try {
            const { id } = req.params;
            const client = await connectRedis();
            if (id) {
                const item = await ItemService.getItemById(id);
                if (!item) {
                    return res.status(404).json({ error: 'Item not found' });
                }
                return res.status(300).json(item);
            } else {
                // client.flushAll();
                const getItemInRedis = await client.get(`items`);
                if (getItemInRedis) {
                    res.status(200).json({ success: true, data: JSON.parse(getItemInRedis) });
                }
                else {
                    const allItems = await ItemService.getAllItems(id);
                    await client.set(`items`, JSON.stringify(allItems), 'EX', 50);
                    res.status(300).json(allItems);
                }
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async batchValidator(req, res) {
        try {
            const { itemIds } = req.body; // Expecting an array of itemIds
            const { validItems, invalidItems } = await ItemService.getItemsByListIds(itemIds);

            if (invalidItems.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Some items are not valid', data: { items: invalidItems } }
                });
            }

            res.status(200).json({ success: true, message: 'All items are valid', data: { items: validItems } });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update item by ID
    static updateItem = [
        // upload.single('image'), // Middleware xử lý upload ảnh
        async (req, res) => {
            try {
                const { id } = req.params;
                const { name, price, description, available, active, categoryId } = req.body;
                //const image = req.file ? req.file.path : null; // Đường dẫn ảnh sau khi upload
                const image = 'temp.png';
                const updatedItem = await ItemService.updateItem({ id, name, price, image, description, available, active, categoryId });
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