import DataModel from "../../models/slider/SliderModel.js";
import {DetailsByIdService} from "../../services/common/DetailsByIdService.js";
import {GetAllSliderService} from "../../services/common/GetAllSliderService.js";
import {CreateSliderService} from "../../services/slider/CreateSliderService.js";
import {UpdateSliderService} from "../../services/slider/UpdateSliderService.js";
import {DeleteSliderService} from "../../services/slider/DeleteSliderService.js";
import {SliderListService} from "../../services/slider/SliderListService.js";
import { createHash } from 'crypto';
import {clearCorruptedCache} from "../../utility/cache/cacheCleanup.js";


// Create
export const CreateSlider = async (req, res) => {
    const result = await CreateSliderService(req, res);
    res.json(result);
}

// Update
export const UpdateSlider = async (req, res) => {
    const result = await UpdateSliderService(req, res);
    res.json(result);
}

// Get All Slider
// Initialize cache cleanup on module load
(async () => {
    try {
        await clearCorruptedCache();
        console.log("✅ All slider service cache initialized successfully");
    } catch (error) {
        console.log("❌ Slider cache initialization failed:", error.message);
    }
})();

// Get All Slider - CONTROLLER
export const AllSlider = async (req, res) => {
    const startTime = Date.now();

    try {
        const result = await GetAllSliderService(req, DataModel);

        // ----------------------------
        // ETag & Cache-Control
        // ----------------------------
        if (!res.get('ETag')) {
            const hash = createHash('md5')
                .update(JSON.stringify(result.data))
                .digest('hex');

            res.set({
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
                'ETag': hash,
                'Vary': 'Accept-Encoding',
                'X-Cache': result.meta.cached ? 'HIT' : 'MISS'
            });
        }

        res.set('X-Response-Time', `${Date.now() - startTime}ms`);

        // Send response
        if (result.status === "success") {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(result);
        }

    } catch (error) {
        console.error('SliderController Unhandled Error:', error);

        const errorTime = Date.now() - startTime;
        res.set('X-Response-Time', `${errorTime}ms`);

        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null
        });
    }
};

// Slider List
export const SliderList = async (req, res) => {
    const SearchRegx = { "$regex": req.params.searchKeyword, "$options": "i" };
    const SearchArray = [{title: SearchRegx},{shortDes: SearchRegx}];
    const result = await SliderListService(req, DataModel, SearchArray);
    res.json(result);
}

// Details
export const SliderDetails = async (req, res) => {
    const result = await DetailsByIdService(req, DataModel);
    res.json(result);
}

// Delete
export const DeleteSlider = async (req, res) => {
    const result = await DeleteSliderService(req, res);
    res.json(result);
}