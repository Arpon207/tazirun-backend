import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false, // Change to false
            ref: 'users'
        },
        guestId: {
            type: String,
            required: false
        },
        sub_total: {
            type: Number,
            required: true
        },
        shippingCost: {
            type: Number,
            required: true
        },
        payable: {
            type: Number,
            required: true
        },
        shiping_area: {
            type: String,
            required: true,
            enum: ['inside_dhaka', 'sub_area_dhaka', 'outside_dhaka']
        },
        ship_details: {
            type: String,
            required: true
        },
        tran_id: {
            type: String,
            required: true,
            unique: true
        },
        val_id: {
            type: String,
            default: "0"
        },
        payment_status: {
            type: String,
            required: true,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending'
        },
        delivery_status: {
            type: String,
            required: true,
            enum: ['pending', 'processing', 'confirmed', 'delivered'],
            default: 'pending'
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ['cash_on_delivery', 'online'], // Add other methods as needed
            default: 'cash_on_delivery'
        },
        products: [{  // Added to track products in the invoice
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products'
            },
            name: String,
            quantity: Number,
            price: Number,
            color: String,
            size: String,
            image: String,
        }],
        pathao: {
            trackingId: String,
            trackingUrl: String,
            status: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const InvoiceModel = mongoose.model('invoice', DataSchema);

export default InvoiceModel;