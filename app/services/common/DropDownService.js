export const DropdownService = async (Request, DataModel, Projection) => {

    try{

        const data = await DataModel.aggregate([
            { $match: { } },
            { $project: Projection }
        ]);

        return { status: "success", data: data };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}