// utils/apiResponse.js
const apiResponse = (req, res, next) => {
    res.apiSuccess = (data, status = 200) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).json({
            status: 'success',
            data
        });
    };

    res.apiError = (message, status = 500, errors = null) => {
        const response = {
            status: 'fail',
            message
        };
        if (errors) response.errors = errors;

        res.setHeader('Content-Type', 'application/json');
        res.status(status).json(response);
    };

    next();
};

module.exports = apiResponse;