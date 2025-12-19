export const CreateService = async (Request, DataModel) => {

    try{

        const role = Request.headers['role'];
        const PostBody = Request.body;


        if(role === "superadmin" || role === "admin"){

            const data = await DataModel.create(PostBody);

            return { status: "success", message: "Request Successful!", data: data };

        }else {
            return { status: "fail", message: "You are not authorized!" };
        }


    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}