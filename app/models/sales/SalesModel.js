import mongoose from "mongoose";

const saleItemVariantSchema = new mongoose.Schema({
    scenarioType: {
        type: String,
        enum: ['scenario1', 'scenario2', 'scenario3'],
        required: true
    },
    color: String,
    size: String,
    qty: {
        type: Number,
        required: true
    },
    unitCost: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
});

const SaleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    customerId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    divisionId: mongoose.Types.ObjectId,
    districtId: mongoose.Types.ObjectId,
    thanaId: mongoose.Types.ObjectId,
    regionId: mongoose.Types.ObjectId,
    items: [{
        productId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        variants: [saleItemVariantSchema],
        totalQty: {
            type: Number,
            required: true
        },
        totalCost: {
            type: Number,
            required: true
        }
    }],
    vatTax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    otherCost: {
        type: Number,
        default: 0
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number,
        required: true
    },
    note: String
}, {
    timestamps: true,
    versionKey: false
});

SaleSchema.virtual('productId').get(function() {
    return this.items.length > 0 ? this.items[0].productId : null;
});

SaleSchema.virtual('productName').get(function() {
    if (this.items.length === 1) {
        return this.items[0].productName;
    } else if (this.items.length > 1) {
        return `${this.items[0].productName} + ${this.items.length - 1} more`;
    }
    return null;
});

SaleSchema.set('toJSON', { virtuals: true });

const SaleModel = mongoose.model('sales', SaleSchema);
export default SaleModel;