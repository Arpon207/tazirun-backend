import multer from 'multer'

const storage = multer.diskStorage({
    // destination: (req, res, cb) => {
    //     cb(null, './uploads/images');
    // },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

const multiUpload = multer({storage: storage});

export default multiUpload;