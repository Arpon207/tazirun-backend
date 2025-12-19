export const CreateWithUniqueService = async (Request, DataModel) => {

    try{

        const role = Request.headers['role'];
        const PostBody = Request.body;
        const {name} = PostBody;


        if(role === "superadmin" || role === "admin"){

            const isExist = await DataModel.findOne({name: name}); 

            if(isExist){
                return { status: "fail", message: `${name} already exist!` };
            }else {
                const data = await DataModel.create(PostBody);

                return { status: "success", message: "Request Successful!", data: data };
            }


        }else {
            return { status: "fail", message: "You are not authorized!" };
        }




    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}