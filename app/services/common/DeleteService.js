import {ObjectId} from "mongodb";

export const DeleteService = async (Request, DataModel) => {

    try{

        const id = new ObjectId(Request.params['id']);

        await DataModel.deleteOne({_id: id});

        return { status: "success", message: "Delete successful!" };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}