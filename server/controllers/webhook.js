const { catchAsync } = require('@utilities/runtime');

exports.webhook = catchAsync(async (req, res) => {
    console.log('Body ->', req.body);

    res.status(200).json({ status: 'success' });
});