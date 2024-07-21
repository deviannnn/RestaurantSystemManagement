const createError = require('http-errors');
const inputChecker = require('../middlewares/input-checker');
//const upload = require('../middlewares/upload');

const { ItemService, CategoryService, RedisService } = require('../services');

const REDIS_KEY_CATALOG_FULL = 'CATALOG_FULL';
const REDIS_KEY_CATALOG_CATEGORY = 'CATALOG_FULL_CATEGORY';
const REDIS_KEY_CATALOG_ITEMS = 'CATALOG_FULL_ITEMS';
const CACHE_EXPIRATION = 10;

async function handleItemSearch(req, res, next, active) {
    try {
        const nameQuery = req.query.name;
        if (!nameQuery) return next(createError(400, 'Invalid input', { data: { field: 'query.name', value: nameQuery, detail: 'Name query parameter is required' } }));

        const searchedItem = await searchItemsByName(nameQuery, active);
        if (!searchedItem || searchedItem.length === 0) return next(createError(404, 'No items found with this name'));

        return res.status(200).json({
            success: true,
            message: 'Get items by name successfully!',
            data: { items: searchedItem }
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    /** Expected Input
     * 
     * { name, price, description, available, active, categoryId } = req.body
     * 
     */
    createItem: [
        inputChecker.checkBodyCaterogy,
        inputChecker.checkCaterogyExist,
        inputChecker.checkBodyCreateItem,
        async (req, res, next) => {
            try {
                const { name, price, description, available, active, categoryId } = req.body;
                // const image = req.file ? req.file.path : null; // Đường dẫn ảnh sau khi upload
                const image = 'temp.png';

                const newItem = await ItemService.createItem({ name, price, image, description, available, active, categoryId });
                res.status(201).json({
                    success: true,
                    message: 'Create item sucessfully!',
                    data: { item: newItem }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * itemId ? = req.params
      * 
     */
    async getItems(req, res, next) {
        try {
            const { itemId } = req.params;
            if (itemId) {
                const item = await ItemService.getItemById(itemId);
                if (!item) return next(createError(404, 'Item not found'));
                res.status(200).json({
                    success: true,
                    message: 'Get item successfully!',
                    data: { item }
                });
            } else {
                const items = await ItemService.getAllItems();
                res.status(200).json({
                    success: true,
                    message: 'Get all items successfully!',
                    data: { items }
                });
            }
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * itemId  = req.params
     * { name, price, description, available, active, categoryId } = req.body
     * 
     */
    updateItem: [
        inputChecker.checkBodyUpdateItem,
        inputChecker.checkCaterogyExist,
        async (req, res, next) => {
            try {
                const { itemId } = req.params;
                const { name, price, description, available, active, categoryId } = req.body;
                //const image = req.file ? req.file.path : null; // Đường dẫn ảnh sau khi upload
                const image = 'temp.png';

                const updatedItem = await ItemService.updateItem({ id: itemId, name, price, image, description, available, active, categoryId });
                if (!updatedItem) return next(createError(404, 'Item not found'));

                return res.status(200).json({
                    success: true,
                    message: 'Update item successfully!',
                    data: { item: updatedItem }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * itemId = req.params
     * 
     */
    async deleteItem(req, res, next) {
        try {
            const { itemId } = req.params;

            const deletedItem = await ItemService.deleteItem(itemId);
            if (!deletedItem) return next(createError(404, 'Item not found'));

            return res.status(200).json({
                success: true,
                message: 'Delete item successfully!',
                data: { item: deletedItem }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * nameQuery = req.query.name
     * 
     */
    async getItemsSearch(req, res, next) {
        return handleItemSearch(req, res, next, null); // không lọc theo active
    },

    async getFullCatalogWithItems(req, res, next) {
        try {
            // Kiểm tra cache trong Redis
            let items = await RedisService.getCacheData(REDIS_KEY_CATALOG_ITEMS);

            if (!items) {
                items = await ItemService.getAllItems(true);
                if (!items || items.length === 0) return next(createError(404, 'No items found in the catalog'));

                await RedisService.saveCacheData({
                    key: REDIS_KEY_CATALOG_ITEMS,
                    value: items,
                    expireTimeInSeconds: CACHE_EXPIRATION
                });
            }

            res.status(200).json({
                success: true,
                message: 'Get full catalog with items successfully!',
                data: { items }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * itemId = req.params
     * 
     */
    async getCatalogByItem(req, res, next) {
        try {
            const { itemId } = req.params;

            const item = await ItemService.getItemById(itemId, true);
            if (!item) return next(createError(404, 'Item not found'));

            res.status(200).json({
                success: true,
                message: 'Get item successfully!',
                data: { item }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * nameQuery = req.query.name
     * 
     */
    async getCatalogItemsSearch(req, res, next) {
        return handleItemSearch(req, res, next, true);
    },

    /** Expected Input
     * 
     * itemId  = req.params
     * { available } = req.body
     * 
     */
    async toggleAvailable(req, res, next) {
        try {
            const { itemId } = req.params;
            const { available } = req.body;

            if (typeof available !== 'boolean') return next(createError(400, 'Invalid input', { data: { field: 'available', value: available, detail: 'Item Available status must be a boolean' } }));

            const toggledItem = await ItemService.updateItem({ id: itemId, available });
            if (!toggledItem) next(createError(404, 'Item not found'));

            // reset cache
            await RedisService.deleteCacheData(REDIS_KEY_CATALOG_FULL);
            await RedisService.deleteCacheData(`${REDIS_KEY_CATALOG_CATEGORY}:${toggledItem.categoryId}`);
            await RedisService.deleteCacheData(REDIS_KEY_CATALOG_ITEMS);

            res.status(200).json({
                success: true,
                message: 'Toggle item successfully!',
                data: { item: toggledItem }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * { itemIds } = req.body
     * (itemIds is list of item_id)
     * 
     */
    batchValidator: [
        inputChecker.checkItemIds,
        async (req, res, next) => {
            try {
                const { itemIds } = req.body; // Expecting an array of itemIds
                const { validItems, invalidItems } = await ItemService.getItemsByListIds(itemIds);

                if (invalidItems.length > 0) {
                    return next(createError(400, 'Some items are not valid', { data: { items: invalidItems } }));
                }

                res.status(200).json({ success: true, message: 'All items are valid', data: { items: validItems } });
            } catch (error) {
                return next(error);
            }
        }
    ]
};