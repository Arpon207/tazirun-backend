import express from 'express';
import pathaoService from "../app/services/pathao/pathaoService.js";
import InvoiceModel from "../models/InvoiceModel.js"; // Changed from OrderModel to InvoiceModel

const router = express.Router();

/**
 * Middleware to verify authentication
 */
const authenticate = (req, res, next) => {
    const token = req.cookies['Token'] || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            status: 'fail',
            message: 'Unauthorized - No authentication token provided'
        });
    }

    req.token = token;
    next();
};

/**
 * Parse shipping address string into key-value pairs
 */
function parseShippingDetails(shippingAddress) {
    if (!shippingAddress) return {};

    try {
        return shippingAddress.split(', ').reduce((details, part) => {
            const [key, value] = part.split(':').map(s => s.trim());
            if (key && value) details[key.toLowerCase()] = value;
            return details;
        }, {});
    } catch (error) {
        console.error('Error parsing shipping details:', error);
        return {};
    }
}

/**
 * @route POST /api/invoices/:id/pathao
 * @desc Create Pathao delivery for an invoice
 * @access Private/Admin
 * @param {string} id - Invoice ID
 */
router.post('/:id/pathao', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // Set token in service (will verify role)
        pathaoService.setUserToken(req.token);

        const invoice = await InvoiceModel.findById(id).populate('userId', 'name phone');
        if (!invoice) {
            return res.status(404).json({
                status: 'fail',
                message: 'Invoice not found'
            });
        }

        if (invoice.pathao?.trackingId) {
            return res.status(400).json({
                status: 'fail',
                message: 'Pathao delivery already created for this invoice',
                trackingId: invoice.pathao.trackingId,
            });
        }

        const shippingDetails = parseShippingDetails(invoice.ship_details);

        // Validate required fields
        const { cityId, zoneId, areaId } = req.body;
        if (!cityId || !zoneId || !areaId) {
            return res.status(400).json({
                status: 'fail',
                message: 'City, zone and area IDs are required'
            });
        }

        const pathaoData = {
            orderId: invoice._id,
            customer: {
                name: shippingDetails.name || invoice.userId?.name || 'Customer',
                phone: shippingDetails.phone || invoice.userId?.phone || '',
            },
            shipping: {
                address: invoice.ship_details,
                city: cityId,
                zone: zoneId,
                area: areaId,
            },
            payment: {
                amountToCollect: invoice.paymentMethod === 'cash_on_delivery' ? invoice.payable : 0,
            },
            items: invoice.products.map(item => ({
                name: item.name,
                quantity: item.quantity,
                weight: 0.5, // Default weight since it's not in your schema
            })),
            deliveryType: req.body.deliveryType || '48',
            specialInstructions: req.body.instructions || '',
        };

        const result = await pathaoService.createDelivery(pathaoData);

        // Update invoice with Pathao details
        invoice.pathao = {
            trackingId: result.data.consignment_id,
            trackingUrl: `https://pathao.com/track/${result.data.consignment_id}`,
            status: result.data.status,
            createdAt: new Date(),
        };
        await invoice.save();

        res.status(201).json({
            status: 'success',
            message: 'Pathao delivery created successfully',
            trackingId: result.data.consignment_id,
            trackingUrl: `https://pathao.com/track/${result.data.consignment_id}`,
            data: result.data,
        });
    } catch (error) {
        console.error('Pathao delivery error:', error);

        const statusCode = error.message.includes('Unauthorized') ? 403 :
            error.message.includes('not found') ? 404 : 500;

        res.status(statusCode).json({
            status: 'fail',
            message: error.message || 'Failed to create Pathao delivery',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
});

/**
 * @route GET /api/invoices/:id/pathao/track
 * @desc Track Pathao delivery for an invoice
 * @access Private
 * @param {string} id - Invoice ID
 */
router.get('/:id/pathao/track', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        pathaoService.setUserToken(req.token);

        const invoice = await InvoiceModel.findById(id);
        if (!invoice) {
            return res.status(404).json({
                status: 'fail',
                message: 'Invoice not found'
            });
        }

        if (!invoice.pathao?.trackingId) {
            return res.status(404).json({
                status: 'fail',
                message: 'No Pathao delivery created for this invoice'
            });
        }

        const trackingInfo = await pathaoService.trackDelivery(invoice.pathao.trackingId);

        // Update invoice status if changed
        if (trackingInfo.data?.status && trackingInfo.data.status !== invoice.pathao.status) {
            invoice.pathao.status = trackingInfo.data.status;
            invoice.pathao.updatedAt = new Date();
            await invoice.save();
        }

        res.json({
            status: 'success',
            data: {
                ...trackingInfo.data,
                trackingUrl: invoice.pathao.trackingUrl,
            }
        });
    } catch (error) {
        console.error('Pathao tracking error:', error);

        const statusCode = error.message.includes('Unauthorized') ? 403 :
            error.message.includes('not found') ? 404 : 500;

        res.status(statusCode).json({
            status: 'fail',
            message: error.message || 'Failed to track Pathao delivery',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
});

export default router;