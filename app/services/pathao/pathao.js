// services/pathao/pathao.js
import axios from 'axios';
import {
    PATHAO_BASE_URL,
    PATHAO_CLIENT_ID,
    PATHAO_CLIENT_SECRET,
    PATHAO_PASSWORD,
    PATHAO_USERNAME
} from "../../config/config.js";

// Create Token
export const CreateTokenService = async (req, res) => {
    try {
        // 1. Validate Role
        const role = req.headers['role'];
        if (!['superadmin', 'admin'].includes(role)) {
            return {
                status: "fail",
                message: "Unauthorized access",
                code: 403
            };
        }

        // 2. Prepare Token Request
        const tokenData = {
            client_id: PATHAO_CLIENT_ID,
            client_secret: PATHAO_CLIENT_SECRET,
            username: PATHAO_USERNAME,
            password: PATHAO_PASSWORD,
            grant_type: "password"
        };

        // 3. Make API Request
        const response = await axios.post(
            `${PATHAO_BASE_URL}/aladdin/api/v1/issue-token`,
            tokenData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 5000 // 5-second timeout
            }
        );

        // 4. Validate Response
        if (!response.data?.access_token) {
            return {
                status: "fail",
                message: "Pathao API returned invalid token",
                code: 502,
                apiResponse: response.data
            };
        }

        // 5. Return Success
        return {
            status: "success",
            message: "Token created successfully",
            code: 200,
            data: {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                expires_in: response.data.expires_in,
                token_type: "Bearer"
            }
        };

    } catch (error) {
        // 6. Error Handling
        const errorData = error.response?.data || error.message;

        return {
            status: "error",
            message: "Token creation failed",
            code: error.response?.status || 500,
            error: process.env.NODE_ENV === 'development' ? errorData : "Internal server error"
        };
    }
};

// List of Cities
export const CityService = async (req, res) => {
    try {
        const role = req.headers['role'];

        if (role !== "superadmin" && role !== "admin") {
            return { status: "fail", message: "You are not authorized!" };
        }

        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                status: "fail",
                message: "Authorization header with Bearer token is required"
            };
        }

        const accessToken = authHeader.split(' ')[1].trim();

        const response = await axios.get(`${PATHAO_BASE_URL}/aladdin/api/v1/city-list`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return {
            status: "success",
            message: "Cities fetched successfully!",
            data: response.data?.data?.data || []
        };

    } catch (e) {
        return {
            status: "error",
            message: "Failed to fetch cities",
            error: e.response?.data ? e.response.data : e.message
        };
    }
}

// Get zones inside a particular city
export const ZoneInsideCityService = async (req, res) => {
    try {
        const role = req.headers['role'];

        // 1. Authorization Check
        if (role !== "superadmin" && role !== "admin") {
            return {
                status: "fail",
                message: "You are not authorized!",
                code: 403
            };
        }

        // 2. Token Validation
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                status: "fail",
                message: "Authorization header with Bearer token is required",
                code: 401
            };
        }

        const accessToken = authHeader.split(' ')[1].trim();

        // 3. City ID Validation
        const { city_id } = req.params; // Assuming city_id comes from route params
        if (!city_id || isNaN(city_id)) {
            return {
                status: "fail",
                message: "Valid city_id is required in URL parameters",
                code: 400
            };
        }

        // 4. API Request
        const response = await axios.get(
            `${PATHAO_BASE_URL}/aladdin/api/v1/cities/${city_id}/zone-list`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        // 5. Response Handling
        if (response.data?.data?.data) {
            return {
                status: "success",
                message: "Zones fetched successfully!",
                code: 200,
                data: response.data.data.data
            };
        } else {
            return {
                status: "fail",
                message: "No zone data found",
                code: 404,
                data: response.data || null
            };
        }

    } catch (e) {
        // 6. Error Handling
        return {
            status: "error",
            message: "Failed to fetch zones",
            code: e.response?.status || 500,
            error: process.env.NODE_ENV === 'development' ?
                (e.response?.data || e.message) :
                "Internal server error"
        };
    }
}

// Get areas inside a particular zone
export const AreaInsideZoneService = async (req, res) => {
    try {
        const role = req.headers['role'];

        // 1. Authorization Check
        if (role !== "superadmin" && role !== "admin") {
            return {
                status: "fail",
                message: "You are not authorized!",
                code: 403
            };
        }

        // 2. Token Validation
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                status: "fail",
                message: "Authorization header with Bearer token is required",
                code: 401
            };
        }

        const accessToken = authHeader.split(' ')[1].trim();

        // 3. Zone ID Validation
        const { zone_id } = req.params; // Changed from city_id to zone_id
        if (!zone_id || isNaN(zone_id)) {
            return {
                status: "fail",
                message: "Valid zone_id is required in URL parameters",
                code: 400
            };
        }

        // 4. API Request - Updated to use area-list endpoint
        const response = await axios.get(
            `${PATHAO_BASE_URL}/aladdin/api/v1/zones/${zone_id}/area-list`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        // 5. Response Handling
        if (response.data?.data?.data) {
            return {
                status: "success",
                message: "Areas fetched successfully!",
                code: 200,
                data: response.data.data.data
            };
        } else {
            return {
                status: "fail",
                message: "No area data found",
                code: 404,
                data: response.data || null
            };
        }

    } catch (e) {
        // 6. Error Handling
        return {
            status: "error",
            message: "Failed to fetch areas",
            code: e.response?.status || 500,
            error: process.env.NODE_ENV === 'development' ?
                (e.response?.data || e.message) :
                "Internal server error"
        };
    }
}

// New Order
export const NewOrderService = async (req) => {
    try {
        // 1. Authorization Check
        // Get role from headers or from authenticated user object
        const role = req.headers['role'] || req.user?.role;

        if (!role || (role !== "superadmin" && role !== "admin")) {
            return {
                status: "fail",
                message: "Unauthorized - Admin or Superadmin role required",
                code: 403
            };
        }

        // 2. Token Verification
        let accessToken;

        // Check Authorization header first
        if (req.headers['authorization']) {
            const authHeader = req.headers['authorization'];
            if (!authHeader.startsWith('Bearer ')) {
                return {
                    status: "fail",
                    message: "Invalid Authorization header format - must be 'Bearer <token>'",
                    code: 401
                };
            }
            accessToken = authHeader.split(' ')[1].trim();
        }
        // Fallback to cookies if needed
        else if (req.cookies?.token) {
            accessToken = req.cookies.token;
        }
        // No token found
        else {
            return {
                status: "fail",
                message: "Authorization token required",
                code: 401
            };
        }

        // 3. Validate Request Body
        const requiredFields = [
            'store_id',
            'merchant_order_id',
            'recipient_name',
            'recipient_phone',
            'recipient_address',
            'recipient_city',
            'recipient_zone',
            'recipient_area'
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return {
                status: "fail",
                message: `Missing required fields: ${missingFields.join(', ')}`,
                code: 400,
                missingFields
            };
        }

        // 4. Prepare Order Data with defaults
        const {
            store_id,
            merchant_order_id,
            recipient_name,
            recipient_phone,
            recipient_address,
            recipient_city,
            recipient_zone,
            recipient_area,
            delivery_type = 48,         // default 48h delivery
            item_type = 2,               // default item type
            special_instruction = '',    // default empty
            item_quantity = 1,           // default 1
            item_weight = 0.5,           // default 0.5kg
            item_description = 'No description provided',
            amount_to_collect = 0        // default COD 0
        } = req.body;

        const orderData = {
            store_id,
            merchant_order_id,
            recipient_name,
            recipient_phone,
            recipient_address,
            recipient_city: parseInt(recipient_city),
            recipient_zone: parseInt(recipient_zone),
            recipient_area: parseInt(recipient_area),
            delivery_type: parseInt(delivery_type),
            item_type: parseInt(item_type),
            special_instruction,
            item_quantity: parseInt(item_quantity),
            item_weight: parseFloat(item_weight).toFixed(1), // Ensure 1 decimal place
            item_description,
            amount_to_collect: parseFloat(amount_to_collect)
        };

        // 5. Make API Call to Pathao
        const response = await axios.post(
            `${PATHAO_BASE_URL}/aladdin/api/v1/orders`,
            orderData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            }
        );

        // 6. Handle Response
        if (!response.data) {
            throw new Error("No data received from Pathao API");
        }

        // Successful response
        return {
            status: "success",
            message: "Order created successfully",
            code: 200,
            data: response.data.data || response.data,
            pathaoResponse: response.data
        };

    } catch (error) {
        console.error('[Pathao Service Error]', error.message);

        // Handle Axios errors specifically
        if (axios.isAxiosError(error)) {
            const axiosError = error;

            // Pathao API error response
            if (axiosError.response) {
                return {
                    status: "error",
                    message: axiosError.response.data?.message || "Pathao API error",
                    code: axiosError.response.status,
                    error: axiosError.response.data,
                    details: `Pathao API Error: ${axiosError.response.statusText}`
                };
            }
            // No response received
            else if (axiosError.request) {
                return {
                    status: "error",
                    message: "No response received from Pathao API",
                    code: 504,
                    error: "Gateway Timeout"
                };
            }
        }

        // Generic error handling
        return {
            status: "error",
            message: "Failed to create order",
            code: 500,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
    }
};

























