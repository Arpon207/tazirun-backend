import express from "express";
const router = express.Router();

import AuthMiddleware from "../app/middlewares/AuthMiddleware.js";
import * as UsersController from "../app/controllers/users/UsersController.js";
import * as BrandsController from "../app/controllers/brands/BrandsController.js";
import * as CategoriesController from "../app/controllers/categories/CategoriesControlller.js";
import * as SubCategoriesController from "../app/controllers/subCategories/SubCategoriesController.js";
import * as SubSubCategoriesController from "../app/controllers/subSubCategories/SubSubCategoriesController.js";
import * as CustomersController from "../app/controllers/customers/CustomersController.js";
import * as SuppliersController from "../app/controllers/suppliers/SuppliersController.js";
import * as ExpensesTypeController from "../app/controllers/expenses/ExpensesTypeController.js";
import * as ExpensesController from "../app/controllers/expenses/ExpensesController.js";
import * as ProductsController from "../app/controllers/products/ProductsController.js";
import * as PurchasesController from "../app/controllers/purchase/PurchasesController.js";
import * as SalesController from "../app/controllers/sales/SalesController.js";
import * as ReturnController from "../app/controllers/return/ReturnController.js";
import * as ReportController from "../app/controllers/report/ReportController.js";
import * as SummaryController from "../app/controllers/summary/SummaryController.js";
import * as DistrictsController from "../app/controllers/areas/district/DistrictController.js";
import * as DivisionsController from "../app/controllers/areas/division/DivisionController.js";
import * as ThanaController from "../app/controllers/areas/thana/ThanaController.js";
import * as RegionController from "../app/controllers/areas/region/RegionController.js";
import * as SliderController from "../app/controllers/sliders/SliderController.js";
import * as CartController from "../app/controllers/cart/CartController.js";
import * as WishController from "../app/controllers/wish/WishController.js";
import * as InvoiceController from "../app/controllers/invoice/InvoiceController.js";
import * as ReviewController from "../app/controllers/review/ReviewController.js";
import * as MarketingCampaignController from "../app/controllers/marketingCampaign/MarketingCampaignController.js";
import * as BannerController from "../app/controllers/banner/BannerController.js";
import * as PathaoController from "../app/controllers/pathao/PathaoController.js";
import * as ProductVariantController from "../app/controllers/productVariant/ProductVariantController.js";

import upload from "../app/middlewares/UplaodFileMiddleware.js";
import multiUpload from "../app/middlewares/UploadMultipleFileMiddleware.js";

// Multiple image for image1 to image5
const multiImageUpload = multiUpload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
  { name: "image5", maxCount: 1 },
]);

// Pathao Route
router.post("/CreateToken", AuthMiddleware, PathaoController.CreateToken);
router.get("/GetCities", AuthMiddleware, PathaoController.GetCities);
router.get(
  "/GetZoneInsideCities/:city_id/zones",
  AuthMiddleware,
  PathaoController.GetZoneInsideCities
);
router.get(
  "/GetAreaInsideZone/:zone_id/areas",
  AuthMiddleware,
  PathaoController.GetAreaInsideZone
);
router.post("/NewOrder", AuthMiddleware, PathaoController.NewOrder);

// Users Route
router.post("/Registration", UsersController.Registration);
router.post("/Login", UsersController.Login);
router.get("/Details", AuthMiddleware, UsersController.Details);
router.post("/EmailVerify/:email", UsersController.EmailVerify);
router.post("/VerifyOtp/:email/:otp", UsersController.VerifyOtp);
router.post("/ResetPassword", UsersController.ResetPassword);
router.post(
  "/ProfileUpdate",
  AuthMiddleware,
  upload.single("photo"),
  UsersController.ProfileUpdate
);
router.post("/Logout", AuthMiddleware, UsersController.Logout);
router.get(
  "/UserDetails/:role/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  UsersController.UserDetails
);
router.get(
  "/DetailsByIdService/:id",
  AuthMiddleware,
  UsersController.DetailsByIdService
);
router.post(
  "/UpdateByIdService/:id",
  AuthMiddleware,
  UsersController.UpdateByIdService
);
router.get("/DeleteUser/:id", AuthMiddleware, UsersController.DeleteUser);

// Brands Route
router.post(
  "/CreateBrand",
  AuthMiddleware,
  upload.single("image"),
  BrandsController.CreateBrand
);
router.post(
  "/UpdateBrand/:id",
  AuthMiddleware,
  upload.single("image"),
  BrandsController.UpdateBrand
);
router.get(
  "/BrandList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  BrandsController.BrandList
);
router.get("/BrandDropDown", AuthMiddleware, BrandsController.BrandDropDown);
router.get("/DeleteBrand/:id", AuthMiddleware, BrandsController.DeleteBrand);
router.get("/BrandDetails/:id", AuthMiddleware, BrandsController.BrandDetails);
router.get("/AllBrand", BrandsController.AllBrand);

// Banner Route
router.post(
  "/CreateBanner",
  AuthMiddleware,
  upload.single("image"),
  BannerController.CreateBanner
);
router.post(
  "/UpdateBanner/:id",
  AuthMiddleware,
  upload.single("image"),
  BannerController.UpdateBanner
);
router.get(
  "/BannerList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  BannerController.BannerList
);
router.get("/DeleteBanner/:id", AuthMiddleware, BannerController.DeleteBanner);
router.get(
  "/BannerDetails/:id",
  AuthMiddleware,
  BannerController.BannerDetails
);
router.get("/AllBanner", BannerController.AllBanner);

// Categories Route
router.post(
  "/CreateCategory",
  AuthMiddleware,
  upload.single("image"),
  CategoriesController.CreateCategory
);
router.post(
  "/UpdateCategory/:id",
  AuthMiddleware,
  upload.single("image"),
  CategoriesController.UpdateCategory
);
router.get(
  "/CategoryList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  CategoriesController.CategoryList
);
router.get(
  "/CategoryDropDown",
  AuthMiddleware,
  CategoriesController.CategoryDropDown
);
router.get(
  "/DeleteCategory/:id",
  AuthMiddleware,
  CategoriesController.DeleteCategory
);
router.get(
  "/CategoryDetails/:id",
  AuthMiddleware,
  CategoriesController.CategoryDetails
);
router.get("/AllCategory", CategoriesController.AllCategory);
router.get(
  "/AllCatWithSubCatAndSubSubCat",
  CategoriesController.AllCatWithSubCatAndSubSubCat
);

// Sub Categories Route
router.post(
  "/CreateSubCategory",
  AuthMiddleware,
  upload.single("image"),
  SubCategoriesController.CreateSubCategory
);
router.post(
  "/UpdateSubCategory/:id",
  AuthMiddleware,
  upload.single("image"),
  SubCategoriesController.UpdateSubCategory
);
router.get(
  "/SubCategoryList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  SubCategoriesController.SubCategoryList
);
router.get(
  "/DeleteSubCategory/:id",
  AuthMiddleware,
  SubCategoriesController.DeleteSubCategory
);
router.get(
  "/SubCategoryDropDown/:id",
  AuthMiddleware,
  SubCategoriesController.SubCategoryDropDown
);
router.get(
  "/OnlySubCategoryDropDown",
  AuthMiddleware,
  SubCategoriesController.OnlySubCategoryDropDown
);
router.get(
  "/SubCategoryDetails/:id",
  AuthMiddleware,
  SubCategoriesController.SubCategoryDetails
);

// Sub Sub Categories Route
router.post(
  "/CreateSubSubCategory",
  AuthMiddleware,
  upload.single("image"),
  SubSubCategoriesController.CreateSubSubCategory
);
router.post(
  "/UpdateSubSubCategory/:id",
  AuthMiddleware,
  upload.single("image"),
  SubSubCategoriesController.UpdateSubSubCategory
);
router.get(
  "/SubSubCategoryList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  SubSubCategoriesController.SubSubCategoryList
);
router.get(
  "/SubSubCategoryDropDown/:id",
  AuthMiddleware,
  SubSubCategoriesController.SubSubCategoryDropDown
);
router.get(
  "/DeleteSubSubCategory/:id",
  AuthMiddleware,
  SubSubCategoriesController.DeleteSubSubCategory
);
router.get(
  "/SubSubCategoryDetails/:id",
  AuthMiddleware,
  SubSubCategoriesController.SubSubCategoryDetails
);

// District Route
router.post(
  "/CreateDistrict",
  AuthMiddleware,
  DistrictsController.CreateDistrict
);
router.post(
  "/UpdateDistrict/:id",
  AuthMiddleware,
  DistrictsController.UpdateDistrict
);
router.get(
  "/DistrictList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  DistrictsController.DistrictList
);
router.get(
  "/DistrictDetails/:id",
  AuthMiddleware,
  DistrictsController.DistrictDetails
);
router.get(
  "/DistrictDropDown",
  AuthMiddleware,
  DistrictsController.DistrictDropDown
);
router.get(
  "/DistrictDelete/:id",
  AuthMiddleware,
  DistrictsController.DistrictDelete
);

// Division Route
router.post(
  "/CreateDivision",
  AuthMiddleware,
  DivisionsController.CreateDivision
);
router.post(
  "/UpdateDivision/:id",
  AuthMiddleware,
  DivisionsController.UpdateDivision
);
router.get(
  "/DivisionList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  DivisionsController.DivisionList
);
router.get(
  "/DivisionDetails/:id",
  AuthMiddleware,
  DivisionsController.DivisionDetails
);
router.get(
  "/DivisionDropDown",
  AuthMiddleware,
  DivisionsController.DivisionDropDown
);
router.get(
  "/DivisionDelete/:id",
  AuthMiddleware,
  DivisionsController.DivisionDelete
);

// Thana Route
router.post("/CreateThana", AuthMiddleware, ThanaController.CreateThana);
router.post("/UpdateThana/:id", AuthMiddleware, ThanaController.UpdateThana);
router.get(
  "/ThanaList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  ThanaController.ThanaList
);
router.get("/ThanaDetails/:id", AuthMiddleware, ThanaController.ThanaDetails);
router.get("/ThanaDropDown", AuthMiddleware, ThanaController.ThanaDropDown);
router.get("/ThanaDelete/:id", AuthMiddleware, ThanaController.ThanaDelete);

// Region Route
router.post("/CreateRegion", AuthMiddleware, RegionController.CreateRegion);
router.post("/UpdateRegion/:id", AuthMiddleware, RegionController.UpdateRegion);
router.get(
  "/RegionList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  RegionController.RegionList
);
router.get(
  "/RegionDetails/:id",
  AuthMiddleware,
  RegionController.RegionDetails
);
router.get("/RegionDropDown", AuthMiddleware, RegionController.RegionDropDown);
router.get("/RegionDelete/:id", AuthMiddleware, RegionController.RegionDelete);

// Customers Route
router.post(
  "/CreateCustomer",
  AuthMiddleware,
  CustomersController.CreateCustomer
);
router.post(
  "/UpdateCustomer/:id",
  AuthMiddleware,
  CustomersController.UpdateCustomer
);
router.get(
  "/CustomerList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  CustomersController.CustomerList
);
router.get(
  "/CustomerDropDown",
  AuthMiddleware,
  CustomersController.CustomerDropDown
);
router.get(
  "/CustomerRegionDropDown",
  AuthMiddleware,
  CustomersController.CustomerRegionDropDown
);
router.get(
  "/CustomerThanaDropDown",
  AuthMiddleware,
  CustomersController.CustomerThanaDropDown
);
router.get(
  "/CustomerDistrictDropDown",
  AuthMiddleware,
  CustomersController.CustomerDistrictDropDown
);
router.get(
  "/CustomerDivisionDropDown",
  AuthMiddleware,
  CustomersController.CustomerDivisionDropDown
);
router.get(
  "/DeleteCustomer/:id",
  AuthMiddleware,
  CustomersController.DeleteCustomer
);
router.get(
  "/CustomerDetails/:id",
  AuthMiddleware,
  CustomersController.CustomerDetails
);

// Suppliers Route
router.post(
  "/CreateSupplier",
  AuthMiddleware,
  SuppliersController.CreateSupplier
);
router.post(
  "/UpdateSupplier/:id",
  AuthMiddleware,
  SuppliersController.UpdateSupplier
);
router.get(
  "/SupplierList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  SuppliersController.SupplierList
);
router.get(
  "/SupplierDropDown",
  AuthMiddleware,
  SuppliersController.SupplierDropDown
);
router.get(
  "/DeleteSupplier/:id",
  AuthMiddleware,
  SuppliersController.DeleteSupplier
);
router.get(
  "/SupplierDetails/:id",
  AuthMiddleware,
  SuppliersController.SupplierDetails
);

// Expenses Type Route
router.post(
  "/CreateExpenseType",
  AuthMiddleware,
  ExpensesTypeController.CreateExpenseType
);
router.post(
  "/UpdateExpenseType/:id",
  AuthMiddleware,
  ExpensesTypeController.UpdateExpenseType
);
router.get(
  "/ExpenseTypeList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  ExpensesTypeController.ExpenseTypeList
);
router.get(
  "/ExpenseTypeDropDown",
  AuthMiddleware,
  ExpensesTypeController.ExpenseTypeDropDown
);
router.get(
  "/ExpenseTypeDetails/:id",
  AuthMiddleware,
  ExpensesTypeController.ExpenseTypeDetails
);
router.get(
  "/ExpenseTypeDelete/:id",
  AuthMiddleware,
  ExpensesTypeController.ExpenseTypeDelete
);

// Expenses Route
router.post("/CreateExpense", AuthMiddleware, ExpensesController.CreateExpense);
router.post(
  "/UpdateExpense/:id",
  AuthMiddleware,
  ExpensesController.UpdateExpense
);
router.get(
  "/ExpenseList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  ExpensesController.ExpenseList
);
router.get(
  "/ExpenseDropDown",
  AuthMiddleware,
  ExpensesController.ExpenseDropDown
);
router.get(
  "/DeleteExpense/:id",
  AuthMiddleware,
  ExpensesController.DeleteExpense
);
router.get(
  "/ExpenseDetails/:id",
  AuthMiddleware,
  ExpensesController.ExpenseDetails
);

// Products Variant Route
router.post(
  "/CreateProductVariant",
  AuthMiddleware,
  upload.single("image"),
  ProductVariantController.CreateProductVariant
);
router.post(
  "/UpdateProductVariant/:id",
  AuthMiddleware,
  upload.single("image"),
  ProductVariantController.UpdateProductVariant
);
router.get(
  "/AllVariantDetails/:id",
  ProductVariantController.AllVariantDetails
);
router.get(
  "/ProductVariantList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  ProductVariantController.ProductVariantList
);
router.get(
  "/DeleteVariant/:id",
  AuthMiddleware,
  ProductVariantController.DeleteVariant
);

// Products Route
router.post(
  "/CreateProduct",
  AuthMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "hoverImage", maxCount: 1 },
  ]),
  ProductsController.CreateProduct
);

router.post(
  "/UpdateProduct/:id",
  AuthMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "hoverImage", maxCount: 1 },
  ]),
  ProductsController.UpdateProduct
);

router.get(
  "/ProductList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  ProductsController.ProductList
);
router.get(
  "/DeleteProduct/:id",
  AuthMiddleware,
  ProductsController.DeleteProduct
);
router.get(
  "/ProductDropDown",
  AuthMiddleware,
  ProductsController.ProductDropDown
);
router.get("/ProductDetails/:id", ProductsController.ProductDetails);
router.get(
  "/ProductDetailByRemark/:remark",
  ProductsController.ProductDetailByRemark
);
router.get(
  "/ProductDetailByCategoryName/:catName",
  ProductsController.ProductDetailByCategoryName
);
router.get(
  "/AllProductDetailByCategoryName/:catName/:pageNo/:perPage/:searchKeyword",
  ProductsController.AllProductDetailByCategoryName
);
router.get(
  "/AllProductDetailByRemark/:remark/:pageNo/:perPage/:searchKeyword",
  ProductsController.AllProductDetailByRemark
);
router.get(
  "/AllProductDetailByCategory/:id/:pageNo/:perPage/:searchKeyword",
  ProductsController.AllProductDetailByCategory
);
router.get(
  "/AllProductDetailByBrand/:id/:pageNo/:perPage/:searchKeyword",
  ProductsController.AllProductDetailByBrand
);
router.get(
  "/AllProductDetailBySlider/:id/:pageNo/:perPage/:searchKeyword",
  ProductsController.AllProductDetailBySlider
);
router.get(
  "/AllProductDetailBySearch/:keyword/:pageNo/:perPage",
  ProductsController.AllProductDetailBySearch
);
router.get(
  "/AllProductDetailByCampaign/:id/:pageNo/:perPage/:searchKeyword",
  ProductsController.AllProductDetailByCampaign
);

// Marketing Campaign Route
router.post(
  "/CreateCampaign",
  AuthMiddleware,
  upload.single("image"),
  MarketingCampaignController.CreateCampaign
);
router.post(
  "/UpdateCampaign/:id",
  AuthMiddleware,
  upload.single("image"),
  MarketingCampaignController.UpdateCampaign
);
router.get(
  "/CampaignList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  MarketingCampaignController.CampaignList
);
router.get("/AllCampaign", MarketingCampaignController.AllCampaign);
router.get(
  "/CampaignById/:id",
  AuthMiddleware,
  MarketingCampaignController.CampaignById
);
router.get(
  "/DeleteCampaign/:id",
  AuthMiddleware,
  MarketingCampaignController.DeleteCampaign
);
router.get(
  "/CampaignDropDown",
  AuthMiddleware,
  MarketingCampaignController.CampaignDropDown
);

// Purchase Route
router.post(
  "/CreatePurchase",
  AuthMiddleware,
  PurchasesController.CreatePurchase
);
router.get(
  "/PurchaseList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  PurchasesController.PurchaseList
);
router.get(
  "/DeletePurchase/:id",
  AuthMiddleware,
  PurchasesController.DeletePurchase
);

// Sales Route
router.post("/CreateSales", AuthMiddleware, SalesController.CreateSales);
router.get(
  "/SalesList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  SalesController.SalesList
);
router.get("/DeleteSale/:id", AuthMiddleware, SalesController.DeleteSale);

// Returns Route
router.post("/CreateReturn", AuthMiddleware, ReturnController.CreateReturn);
router.get(
  "/ReturnList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  ReturnController.ReturnList
);
router.get("/DeleteReturn/:id", AuthMiddleware, ReturnController.DeleteReturn);

// Report Route
router.post("/ExpenseReport", AuthMiddleware, ReportController.ExpenseReport);
router.post("/ReturnReport", AuthMiddleware, ReportController.ReturnReport);
router.post("/PurchaseReport", AuthMiddleware, ReportController.PurchaseReport);
router.post("/SaleReport", AuthMiddleware, ReportController.SaleReport);

// Summary Route
router.get(
  "/TotalRevenueSummary",
  AuthMiddleware,
  SummaryController.TotalRevenueSummary
);
router.get("/ExpenseSummary", AuthMiddleware, SummaryController.ExpenseSummary);
router.get("/ReturnSummary", AuthMiddleware, SummaryController.ReturnSummary);
router.get(
  "/PurchaseSummary",
  AuthMiddleware,
  SummaryController.PurchaseSummary
);
router.get("/SaleSummary", AuthMiddleware, SummaryController.SaleSummary);
router.get(
  "/SaleSummaryByDistrict/:district",
  AuthMiddleware,
  SummaryController.SaleSummaryByDistrict
);

// Sliders Route
router.post(
  "/CreateSlider",
  AuthMiddleware,
  upload.single("image"),
  SliderController.CreateSlider
);
router.post(
  "/UpdateSlider/:id",
  AuthMiddleware,
  upload.single("image"),
  SliderController.UpdateSlider
);
router.get(
  "/SliderList/:pageNo/:perPage/:searchKeyword",
  AuthMiddleware,
  SliderController.SliderList
);
router.get("/DeleteSlider/:id", AuthMiddleware, SliderController.DeleteSlider);
router.get(
  "/SliderDetails/:id",
  AuthMiddleware,
  SliderController.SliderDetails
);
router.get("/AllSlider", SliderController.AllSlider);

// Carts Route
router.get("/CartList", CartController.CartList);
router.post("/SaveCartList", CartController.SaveCartList);
router.post("/UpdateCartList/:id", CartController.UpdateCartList);
router.get("/DeleteCartList/:id", CartController.DeleteCartList);

// Wishes Route
router.get("/WishList", WishController.WishList);
router.post("/SaveWishList", WishController.SaveWishList);
router.get("/RemoveWishList/:id", WishController.RemoveWishList);

// Invoice Route
router.post("/CreateInvoice", InvoiceController.CreateInvoice);
router.get(
  "/InvoiceList/:status",
  AuthMiddleware,
  InvoiceController.InvoiceList
);
router.post(
  "/UpdateInvoiceList/:id",
  AuthMiddleware,
  InvoiceController.UpdateInvoiceList
);
router.post(
  "/InvoiceListByDeliveryStatus/:status",
  AuthMiddleware,
  InvoiceController.InvoiceListByDeliveryStatus
);
router.post(
  "/InvoiceListCount",
  AuthMiddleware,
  InvoiceController.InvoiceListCount
);
router.get(
  "/DeleteInvoice/:id",
  AuthMiddleware,
  InvoiceController.DeleteInvoice
);

// Review Route
router.post(
  "/CreateReview/:id",
  upload.array("images", 5),
  ReviewController.CreateReview
);
router.get("/ReviewList/:id", ReviewController.ReviewList);
router.get("/ReviewDelete/:id", ReviewController.ReviewDelete);

// Protected route - this requires authentication and will respond with user details if authenticated.
router.get("/protected", AuthMiddleware, (req, res) => {
  const userData = {
    email: req.headers.email,
    user_id: req.headers.user_id,
    isBanned: req.headers.isBanned,
    role: req.headers.role,
  };
  res.json({ status: "success", message: "Access granted", user: userData });
});

export default router;
