const ItemService = require('../services/item.service');
const CategoryService = require('../services/category.service');
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
            const client = await connectRedis();

            const toggledItem = await ItemService.updateItem({ id, available });
            if (toggledItem) {
                client.flushAll();

                const allItems = await ItemService.getAllItems();
                await client.set(`items`, JSON.stringify(allItems), 'EX', 50);

                const allItemsClient = await ItemService.getAllItemsForClient();
                await client.set(`allItemsClient`, JSON.stringify(allItemsClient), 'EX', 50);

                res.status(200).json(toggledItem);
            } else {
                res.status(404).json({ error: 'Item not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get all items or get item by ID
    static async getItems(req, res) {
        try {
            const { id } = req.params;
            if (id) {
                const item = await ItemService.getItemById(id);
                if (!item) {
                    return res.status(404).json({ error: 'Item not found' });
                }
                return res.status(300).json(item);
            } else {
                const allItems = await ItemService.getAllItems();
                res.status(300).json(allItems);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getItemsForClient(req, res, next) {
        try {
            const qName = req.query.name;

            if (qName) {
                const find = await ItemService.searchItemByName(qName);
                if (!find) {
                    return res.status(404).json({ message: 'Could not find a dish with that name' });
                }
                return res.status(200).json(find);
            } else {
                const client = await connectRedis();

                const allItemsClient = await client.get('allItemsClient');
                if (allItemsClient) {
                    return res.status(300).json(JSON.parse(allItemsClient));
                }

                const item = await CategoryService.getAllCategories(true);
                if (!item) {
                    return res.status(404).json({ error: 'All Item not found' });
                }

                await client.set('allItemsClient', JSON.stringify(item), 'EX', 50);
                return res.status(200).json(item);
            }
        } catch (error) {
            next(error);
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
            next(error);
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