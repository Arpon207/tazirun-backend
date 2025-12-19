import express from 'express';
import pathaoService from "../app/services/pathao/pathaoService.js";
import apiResponse from "../app/services/pathao/apiResponse.js";
import InvoiceModel from "../app/models/invoice/InvoiceModel.js";

const router = express.Router();

router.use(apiResponse); // Apply response middleware

const verifyAdmin = (req, res, next) => {
    try {
        const token = req.cookies['Token'] || req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.apiError('Unauthorized - No token provided', 401);
        }

        pathaoService.setUserToken(token);
        pathaoService.verifyAdminAccess();
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        const status = error.message.includes('Unauthorized') ? 401 : 403;
        res.apiError(error.message, status);
    }
};

router.get('/cities', verifyAdmin, async (req, res) => {
    try {
        // Debug log
        console.log('Attempting to fetch cities from Pathao...');

        const cities = await pathaoService.getCities();

        // Debug log
        console.log(`Successfully fetched ${cities.length} cities`);

        res.apiSuccess(cities);
    } catch (error) {
        console.error('Cities route error:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date()
        });

        res.apiError(error.message || 'Failed to load cities. Please try again later.');
    }
});

router.get('/zones', verifyAdmin, async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.apiError('City ID is required', 400);
        }

        const result = await pathaoService.getZones(city);
        res.apiSuccess(result.data);
    } catch (error) {
        console.error('Pathao zones error:', error);
        res.apiError(error.message || 'Failed to fetch zones');
    }
});

router.get('/areas', verifyAdmin, async (req, res) => {
    try {
        const { zone } = req.query;
        if (!zone) {
            return res.apiError('Zone ID is required', 400);
        }

        const result = await pathaoService.getAreas(zone);
        res.apiSuccess(result.data);
    } catch (error) {
        console.error('Pathao areas error:', error);
        res.apiError(error.message || 'Failed to fetch areas');
    }
});

router.post('/invoices/:id/pathao', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await InvoiceModel.findById(id).populate('userId', 'name phone');

        if (!invoice) {
            return res.apiError('Invoice not found', 404);
        }

        if (invoice.pathao?.trackingId) {
            return res.apiError('Pathao delivery already exists', 400, {
                trackingId: invoice.pathao.trackingId
            });
        }

        const { cityId, zoneId, areaId, deliveryType, instructions } = req.body;
        if (!cityId || !zoneId || !areaId) {
            return res.apiError('City, zone and area IDs are required', 400);
        }

        const pathaoData = {
            orderId: invoice._id,
            customer: {
                name: invoice.userId?.name || 'Customer',
                phone: invoice.userId?.phone || '',
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
                weight: 0.5,
            })),
            deliveryType: deliveryType || '48',
            specialInstructions: instructions || '',
        };

        const result = await pathaoService.createDelivery(pathaoData);

        invoice.pathao = {
            trackingId: result.data.consignment_id,
            trackingUrl: `https://pathao.com/track/${result.data.consignment_id}`,
            status: result.data.status,
            createdAt: new Date(),
        };

        await invoice.save();

        res.apiSuccess({
            trackingId: result.data.consignment_id,
            trackingUrl: `https://pathao.com/track/${result.data.consignment_id}`,
            data: result.data,
        }, 201);
    } catch (error) {
        console.error('Pathao delivery error:', error);
        const status = error.message.includes('not found') ? 404 : 500;
        res.apiError(error.message || 'Failed to create delivery', status);
    }
});

export default router;