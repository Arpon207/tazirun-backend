export const ListTwoJoinServiceWithoutProjection = async (
    Request,
    DataModel,
    SearchArray,
    JoinStage1,
    JoinStage2,
    UnwindBrandStage1,
    UnwindBrandStage2
) => {
    try {
        const pageNo = Number(Request.params.pageNo);
        const perPage = Number(Request.params.perPage);
        const searchValue = Request.params.searchKeyword;

        const skipRow = (pageNo - 1) * perPage;

        let queryStages = [
            JoinStage1,
            JoinStage2,
            UnwindBrandStage1,
            UnwindBrandStage2,
            {
                $project: {
                    // Include all original fields
                    _id: 1,
                    userId: 1,
                    productId: 1,
                    customerId: 1,
                    regionId: 1,
                    thanaId: 1,
                    districtId: 1,
                    divisionId: 1,
                    customerName: 1,
                    productName: 1,
                    email: 1,
                    vatTax: 1,
                    discount: 1,
                    otherCost: 1,
                    shippingCost: 1,
                    grandTotal: 1,
                    note: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    // Include joined fields
                    customers: 1,
                    products: 1,
                    suppliers:1
                }
            }
        ];

        if (searchValue !== "0") {
            queryStages.push({ $match: { $or: SearchArray } });
        }

        queryStages.push({
            $facet: {
                Total: [{ $count: "count" }],
                Rows: [{ $skip: skipRow }, { $limit: perPage }]
            }
        });

        const data = await DataModel.aggregate(queryStages);

        return { status: "success", data: data };
    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};