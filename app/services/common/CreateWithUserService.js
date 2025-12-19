export const CreateWithUserService = async (Request, DataModel) => {

    try{

        const role = Request.headers['role'];
        const userId = Request.headers['user_id'];
        const email = Request.headers['email'];
        const PostBody = Request.body;
        PostBody.userId = userId;
        PostBody.email = email;


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