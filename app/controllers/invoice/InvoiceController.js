import {CreateInvoiceService} from "../../services/invoice/CreateInvoiceService.js";
import {InvoiceListService} from "../../services/invoice/InvoiceListService.js";
import {UpdateInvoiceListService} from "../../services/invoice/UpdateInvoiceListService.js";
import {InvoiceListByDeliveryStatusService} from "../../services/invoice/InvoiceListByDeliveryStatus.js";
import {InvoiceListCountByDeliveryStatusService} from "../../services/invoice/InvoiceListCountByDeliveryStatus.js";
import {DeleteService} from "../../services/common/DeleteService.js";
import DataModel from "../../models/invoice/InvoiceModel.js";

// Create
export const CreateInvoice = async (req, res) => {
    try {
        const result = await CreateInvoiceService(req);
        res.json(result);
    } catch (error) {
        console.error('Invoice controller error:', error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
}

// Invoice List
export const InvoiceList = async (req, res) => {
    const result = await InvoiceListService(req, res);
    res.json(result);
}

// Update Invoice List
export const UpdateInvoiceList = async (req, res) => {
    const result = await UpdateInvoiceListService(req, res);
    res.json(result);
}

// Invoice List By Delivery Status
export const InvoiceListByDeliveryStatus = async (req, res) => {
    const result = await InvoiceListByDeliveryStatusService(req, res);
    res.json(result);
}

// Invoice List Count By Delivery Status
export const InvoiceListCount = async (req, res) => {
    const result = await InvoiceListCountByDeliveryStatusService(req, res);
    res.json(result);
}

// Delete Invoice List
export const DeleteInvoice = async (req, res) => {
    const result = await DeleteService(req, DataModel);
    res.json(result);
}