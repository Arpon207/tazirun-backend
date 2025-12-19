import {
    AreaInsideZoneService,
    CityService,
    CreateTokenService, NewOrderService,
    ZoneInsideCityService
} from "../../services/pathao/pathao.js";

// Create Token
export const CreateToken = async (req, res) => {
    const result = await CreateTokenService(req, res);
    res.json(result);
}

// List of Cities
export const GetCities = async (req, res) => {
    const result = await CityService(req, res);
    res.json(result);
}

// Get zones inside a particular city
export const GetZoneInsideCities = async (req, res) => {
    const result = await ZoneInsideCityService(req, res);
    res.json(result);
}

// Get zones inside a particular city
export const GetAreaInsideZone = async (req, res) => {
    const result = await AreaInsideZoneService(req, res);
    res.json(result);
}

// Create New Order
export const NewOrder = async (req, res) => {
    try {
        const result = await NewOrderService(req);

        if (result.status === "success") {
            return res.status(200).json(result);
        } else if (result.status === "fail") {
            return res.status(400).json(result);
        } else {
            return res.status(500).json(result);
        }
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        });
    }
}








