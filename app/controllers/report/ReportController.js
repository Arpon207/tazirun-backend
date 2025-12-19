import {ExpenseReportService} from "../../services/report/ExpenseReportService.js";
import {ReturnReportService} from "../../services/report/ReturnReportService.js";
import {PurchaseReportService} from "../../services/report/PurchaseReportService.js";
import {SaleReportService} from "../../services/report/SalesReportService.js";

// Expense Report
export const ExpenseReport = async (req, res) => {
    const result = await ExpenseReportService(req);
    res.json(result);
}

// Return Report
export const ReturnReport = async (req, res) => {
    const result = await ReturnReportService(req);
    res.json(result);
}

// Purchase Report
export const PurchaseReport = async (req, res) => {
    const result = await PurchaseReportService(req);
    res.json(result);
}

// Sale Report
export const SaleReport = async (req, res) => {
    const result = await SaleReportService(req);
    res.json(result);
}