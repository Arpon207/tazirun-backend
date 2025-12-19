export const createDBIndexes = async (db) => {
    try {
        // First, get existing indexes to avoid conflicts
        const existingIndexes = await db.collection("products").indexes();

        // Check if text index already exists
        const existingTextIndex = existingIndexes.find(index =>
            index.name && index.name.includes('_text')
        );

        console.log("🔄 Checking existing indexes...");

        // -----------------------------
        // 🔥 PRODUCT INDEXES - OPTIMIZED
        // -----------------------------
        await createIndexSafely(db.collection("products"), { _id: 1 });

        // Single Field Indexes
        await createIndexSafely(db.collection("products"), { brandId: 1 });
        await createIndexSafely(db.collection("products"), { categoryId: 1 });
        await createIndexSafely(db.collection("products"), { remark: 1 });
        await createIndexSafely(db.collection("products"), { catName: 1 });
        await createIndexSafely(db.collection("products"), { subCategoryId: 1 });
        await createIndexSafely(db.collection("products"), { subSubCategoryId: 1 });
        await createIndexSafely(db.collection("products"), { createdAt: -1 });
        await createIndexSafely(db.collection("products"), { price: 1 });
        await createIndexSafely(db.collection("products"), { discount: -1 });
        await createIndexSafely(db.collection("products"), { stock: 1 });

        // Compound Indexes for Common Query Patterns
        await createIndexSafely(db.collection("products"), { remark: 1, _id: -1 });
        await createIndexSafely(db.collection("products"), { catName: 1, _id: -1 });
        await createIndexSafely(db.collection("products"), { categoryId: 1, createdAt: -1 });
        await createIndexSafely(db.collection("products"), { brandId: 1, createdAt: -1 });
        await createIndexSafely(db.collection("products"), { remark: 1, createdAt: -1 });
        await createIndexSafely(db.collection("products"), { categoryId: 1, price: 1 });
        await createIndexSafely(db.collection("products"), { categoryId: 1, discount: -1 });

        // Text Search Index - Only create if doesn't exist with current fields
        if (!existingTextIndex) {
            try {
                await db.collection("products").createIndex({
                    name: "text",
                    details: "text",
                    specification: "text"
                });
                console.log("✅ Text search index created");
            } catch (textIndexError) {
                console.log("ℹ️ Text index already exists or cannot be created");
            }
        } else {
            console.log("ℹ️ Using existing text index:", existingTextIndex.name);
        }

        // Partial Indexes for Better Performance
        try {
            await createIndexSafely(db.collection("products"),
                { stock: 1 },
                { partialFilterExpression: { stock: { $gt: 0 } } }
            );

            await createIndexSafely(db.collection("products"),
                { isActive: 1 },
                { partialFilterExpression: { isActive: true } }
            );
        } catch (partialError) {
            console.log("ℹ️ Partial indexes may not be supported or already exist");
        }

        console.log("✅ Product indexes ensured");

        // -----------------------------
        // 🔥 BRAND INDEXES - OPTIMIZED
        // -----------------------------
        await createIndexSafely(db.collection("brands"), { _id: 1 });
        await createIndexSafely(db.collection("brands"), { name: 1 });
        await createIndexSafely(db.collection("brands"), { createdAt: -1 });
        await createIndexSafely(db.collection("brands"), { isActive: 1 });

        console.log("✅ Brand indexes ensured");

        // -----------------------------
        // 🔥 CATEGORY INDEXES - OPTIMIZED
        // -----------------------------
        await createIndexSafely(db.collection("categories"), { _id: 1 });
        await createIndexSafely(db.collection("categories"), { name: 1 });
        await createIndexSafely(db.collection("categories"), { createdAt: -1 });
        await createIndexSafely(db.collection("categories"), { isActive: 1 });

        console.log("✅ Category indexes ensured");

        // -----------------------------
        // 🔥 SUBCATEGORY INDEXES
        // -----------------------------
        await createIndexSafely(db.collection("subcategories"), { _id: 1 });
        await createIndexSafely(db.collection("subcategories"), { categoryId: 1 });
        await createIndexSafely(db.collection("subcategories"), { name: 1 });
        await createIndexSafely(db.collection("subcategories"), { isActive: 1 });

        console.log("✅ Subcategory indexes ensured");

        // -----------------------------
        // 🔥 SUBSUBCATEGORY INDEXES
        // -----------------------------
        await createIndexSafely(db.collection("subsubcategories"), { _id: 1 });
        await createIndexSafely(db.collection("subsubcategories"), { subCategoryId: 1 });
        await createIndexSafely(db.collection("subsubcategories"), { name: 1 });
        await createIndexSafely(db.collection("subsubcategories"), { isActive: 1 });

        console.log("✅ Subsubcategory indexes ensured");

        // -----------------------------
        // 🔥 SLIDER INDEXES - OPTIMIZED
        // -----------------------------
        await createIndexSafely(db.collection("sliders"), { _id: 1 });
        await createIndexSafely(db.collection("sliders"), {
            isActive: 1,
            createdAt: -1,
        });
        await createIndexSafely(db.collection("sliders"), { position: 1 });

        console.log("✅ Slider indexes ensured");

        // -----------------------------
        // 🔥 ORDER INDEXES
        // -----------------------------
        await createIndexSafely(db.collection("orders"), { _id: 1 });
        await createIndexSafely(db.collection("orders"), { userId: 1 });
        await createIndexSafely(db.collection("orders"), { status: 1 });
        await createIndexSafely(db.collection("orders"), { createdAt: -1 });
        await createIndexSafely(db.collection("orders"), { userId: 1, createdAt: -1 });

        console.log("✅ Order indexes ensured");

        // -----------------------------
        // 🔥 USER INDEXES
        // -----------------------------
        await createIndexSafely(db.collection("users"), { _id: 1 });
        await createIndexSafely(db.collection("users"), { email: 1 });
        await createIndexSafely(db.collection("users"), { phone: 1 });
        await createIndexSafely(db.collection("users"), { createdAt: -1 });

        console.log("✅ User indexes ensured");

        // -----------------------------
        // 🔥 CART INDEXES
        // -----------------------------
        await createIndexSafely(db.collection("carts"), { _id: 1 });
        await createIndexSafely(db.collection("carts"), { userId: 1 });
        await createIndexSafely(db.collection("carts"), { productId: 1 });
        await createIndexSafely(db.collection("carts"), { userId: 1, productId: 1 });

        console.log("✅ Cart indexes ensured");

        // -----------------------------
        // 🔥 WISHLIST INDEXES
        // -----------------------------
        await createIndexSafely(db.collection("wishlists"), { _id: 1 });
        await createIndexSafely(db.collection("wishlists"), { userId: 1 });
        await createIndexSafely(db.collection("wishlists"), { productId: 1 });
        await createIndexSafely(db.collection("wishlists"), { userId: 1, productId: 1 });

        console.log("✅ Wishlist indexes ensured");

        console.log("🎉 All database indexes optimized successfully!");

    } catch (err) {
        console.error("❌ Index creation error:", err.message);
    }
};

// Helper function to create indexes safely
async function createIndexSafely(collection, keys, options = {}) {
    try {
        // Generate index name from keys if not provided
        const indexName = options.name || generateIndexName(keys);

        // Check if index already exists
        const existingIndexes = await collection.indexes();
        const indexExists = existingIndexes.some(index =>
            index.name === indexName ||
            JSON.stringify(index.key) === JSON.stringify(keys)
        );

        if (!indexExists) {
            await collection.createIndex(keys, { ...options, name: indexName });
            console.log(`✅ Created index: ${indexName}`);
        } else {
            console.log(`ℹ️ Index already exists: ${indexName}`);
        }
    } catch (error) {
        if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
            console.log(`ℹ️ Index conflict (already exists with different options): ${generateIndexName(keys)}`);
        } else if (error.code === 86 || error.codeName === 'IndexKeySpecsConflict') {
            console.log(`ℹ️ Index key conflict (already exists): ${generateIndexName(keys)}`);
        } else {
            console.log(`⚠️ Could not create index ${generateIndexName(keys)}:`, error.message);
        }
    }
}

// Helper function to generate consistent index names
function generateIndexName(keys) {
    return Object.entries(keys)
        .map(([key, value]) => `${key}_${value}`)
        .join('_');
}