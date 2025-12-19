import axios from 'axios';
import qs from 'qs';
import { v4 as uuidv4 } from 'uuid';
import {
    PATHAO_BASE_URL,
    PATHAO_CLIENT_ID,
    PATHAO_CLIENT_SECRET,
    PATHAO_STORE_ID,
    PATHAO_USERNAME,
    PATHAO_PASSWORD
} from "../../config/config.js";
import {TokenDecode} from "../../utility/TokenUtility.js";

class PathaoService {
    constructor() {
        this.baseUrl = PATHAO_BASE_URL || 'https://courier-api-sandbox.pathao.com';
        this.token = null;
        this.tokenExpires = null;
        this.userToken = null;
    }

    setUserToken(token) {
        this.userToken = token;
    }

    verifyAdminAccess() {
        if (!this.userToken) throw new Error('Unauthorized - No token provided');

        const decoded = TokenDecode(this.userToken);
        if (!decoded) throw new Error('Invalid token');
        if (decoded.isBanned) throw new Error('User is banned');
        if (!['superadmin', 'admin'].includes(decoded.role)) {
            throw new Error('Admin privileges required');
        }
    }

    async getPathaoHeaders() {
        const pathaoToken = await this.ensureAuthenticated();
        return {
            'Authorization': `Bearer ${pathaoToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }


    async authenticate() {
        try {
            const payload = qs.stringify({
                client_id: PATHAO_CLIENT_ID,
                client_secret: PATHAO_CLIENT_SECRET,
                username: PATHAO_USERNAME,
                password: PATHAO_PASSWORD,
                grant_type: 'password',
            });

            const response = await axios.post(`${this.baseUrl}/oauth/token`, payload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            if (!response.data.access_token) {
                throw new Error('No access token received from Pathao');
            }

            this.token = response.data.access_token;
            this.tokenExpires = Date.now() + (response.data.expires_in * 1000);
            return this.token;
        } catch (error) {
            console.error('Pathao authentication failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async ensureAuthenticated() {
        if (!this.token || Date.now() >= this.tokenExpires) {
            await this.authenticate();
        }
        return this.token;
    }

    async createDelivery(orderData) {
        try {
            this.verifyAdminAccess();
            const headers = await this.getPathaoHeaders();

            const pathaoOrder = {
                store_id: PATHAO_STORE_ID,
                merchant_order_id: orderData.orderId || uuidv4(),
                recipient_name: orderData.customer.name,
                recipient_phone: orderData.customer.phone,
                recipient_address: orderData.shipping.address,
                recipient_city: orderData.shipping.city,
                recipient_zone: orderData.shipping.zone,
                recipient_area: orderData.shipping.area,
                amount_to_collect: orderData.payment.amountToCollect,
                item_description: orderData.items.map(item => item.name).join(', '),
                item_quantity: orderData.items.reduce((sum, item) => sum + item.quantity, 0),
                item_weight: orderData.items.reduce((sum, item) => sum + (item.weight || 0.5), 0),
                delivery_type: orderData.deliveryType || '48',
                instruction: orderData.specialInstructions || '',
            };

            const response = await axios.post(`${this.baseUrl}/aladdin/api/v1/order`, pathaoOrder, { headers });

            return {
                status: 'success',
                data: response.data,
            };
        } catch (error) {
            console.error('Delivery creation failed:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to create delivery');
        }
    }

    async trackDelivery(orderId) {
        try {
            const headers = await this.getPathaoHeaders();
            const response = await axios.get(`${this.baseUrl}/aladdin/api/v1/order/${orderId}`, { headers });

            return {
                status: 'success',
                data: response.data,
            };
        } catch (error) {
            console.error('Tracking failed:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to track delivery');
        }
    }

    async getCities() {
        try {
            const token = await this.ensureAuthenticated();
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };
            const url = `${this.baseUrl}/aladdin/api/v1/city-list`;
            console.log('[PathaoService] getCities → calling:', url);

            const response = await axios.get(url, { headers });
            console.log('[PathaoService] getCities → raw response:', JSON.stringify(response.data, null, 2));

            if (!response.data || !response.data.data || !Array.isArray(response.data.data.data)) {
                console.error('[PathaoService] getCities → Invalid structure:', response.data);
                throw new Error('Invalid data structure received from Pathao');
            }

            return response.data.data.data; // <- Correct path
        } catch (error) {
            console.error('[PathaoService] getCities error details:', {
                message: error.message,
                responseData: error.response?.data,
                url: error.config?.url,
                status: error.response?.status,
            });
            throw new Error('Failed to retrieve cities from Pathao');
        }
    }




    async getZones(cityId) {
        try {
            this.verifyAdminAccess();
            const headers = await this.getPathaoHeaders();
            const response = await axios.get(`${this.baseUrl}/aladdin/api/v1/cities/${cityId}/zone-list`, { headers });

            if (!response.data?.data) {
                throw new Error('Invalid zones data format');
            }

            return {
                status: 'success',
                data: response.data.data,
            };
        } catch (error) {
            console.error('Failed to fetch zones:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch zones');
        }
    }

    async getAreas(zoneId) {
        try {
            this.verifyAdminAccess();
            const headers = await this.getPathaoHeaders();
            const response = await axios.get(`${this.baseUrl}/aladdin/api/v1/zones/${zoneId}/area-list`, { headers });

            if (!response.data?.data) {
                throw new Error('Invalid areas data format');
            }

            return {
                status: 'success',
                data: response.data.data,
            };
        } catch (error) {
            console.error('Failed to fetch areas:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch areas');
        }
    }
}

export default new PathaoService();