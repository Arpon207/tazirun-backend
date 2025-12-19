export const CheckAssociateService = async (QueryObject, AssociateModel) => {

    try{

        const data = await AssociateModel.aggregate([
            { $match: QueryObject }
        ]);

        return data.length > 0;

    }catch (e) {
        return false;
    }

}