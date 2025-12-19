import { ObjectId } from "mongodb";

export const ListService = async (
    Request,
    DataModel,
    SearchArray,
    JoinStage1,
    UnwindBrandStage1,
    Projection
) => {
    try {
        const pageNo = Number(Request.params.pageNo);
        const perPage = Number(Request.params.perPage);
        const searchValue = Request.params.searchKeyword;

        const email = Request.headers["email"];
        const userId = new ObjectId(Request.headers["user_id"]);

        let skipRow = (pageNo - 1) * perPage;
        let data;

        // Common stock calculation stage
        const AddTotalStockStage = {
            $addFields: {
                totalStock: {
                    $sum: [
                        {
                            // Scenario 1: sum of all qty in sizes array
                            $sum: {
                                $map: {
                                    input: "$scenario1",
                                    as: "s1",
                                    in: {
                                        $sum: {
                                            $map: {
                                                input: "$$s1.sizes",
                                                as: "sizeObj",
                                                in: { $toInt: "$$sizeObj.qty" }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            // Scenario 2: sum of qty directly
                            $sum: {
                                $map: {
                                    input: "$scenario2",
                                    as: "s2",
                                    in: { $toInt: "$$s2.qty" }
                                }
                            }
                        },
                        {
                            // Scenario 3: sum of qty directly
                            $sum: {
                                $map: {
                                    input: "$scenario3",
                                    as: "s3",
                                    in: { $toInt: "$$s3.qty" }
                                }
                            }
                        }
                    ]
                }
            }
        };

        if (searchValue !== "0") {
            let searchQuery = { $or: SearchArray };

            data = await DataModel.aggregate([
                { $match: searchQuery },
                JoinStage1,
                UnwindBrandStage1,
                AddTotalStockStage,
                Projection,
                {
                    $facet: {
                        Total: [{ $count: "count" }],
                        Rows: [{ $skip: skipRow }, { $limit: perPage }],
                    }
                }
            ]);
        } else {
            data = await DataModel.aggregate([
                JoinStage1,
                UnwindBrandStage1,
                AddTotalStockStage,
                Projection,
                {
                    $facet: {
                        Total: [{ $count: "count" }],
                        Rows: [{ $skip: skipRow }, { $limit: perPage }],
                    }
                }
            ]);
        }

        return { status: "success", data: data };
    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};
