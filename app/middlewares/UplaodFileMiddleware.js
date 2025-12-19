import multer from 'multer'

const storage = multer.diskStorage({
    // destination: (req, res, cb) => {
    //     cb(null, './uploads/images');
    // },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

const upload = multer({storage: storage});

export default upload;