export const UpdateService = async (Request, DataModel) => {

    try{

        const role = Request.headers['role'];
        const id = Request.params.id;
        const PostBody = Request.body;

        if(role === "superadmin" || role === "admin"){

            const data = await DataModel.updateOne({_id: id}, PostBody);

            return { status: "success", data: data };

        }else {
            return { status: "fail", message: "You are not authorized!" };
        }


    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}