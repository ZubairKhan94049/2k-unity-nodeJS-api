const { default: mongoose } = require("mongoose");
const Notification = require("../models/notificationModel");

module.exports = {
    send_notification: async (req, res, next) => {
        const notification = new Notification({
            _id: new mongoose.Types.ObjectId(),
            sender: req.body.sender,
            recipient: req.body.recipient,
            message: req.body.message,
            isRead: req.body.isRead,
        });

        notification.save()
            .then(result => {
                return res.status(200).json({
                    success: true,
                    message: "Notification hes been sent successfully",
                    result: result,
                });
            })
            .catch(error => {
                res.status(500).json({
                    error: error.message,
                })
            });
    },

    get_all_notifications_of_user_by_id: async (req, res, next) => {
        try {
            const userID = req.params.userID;

            const notifications = await Notification.find({ recipient: userID });

            if (notifications) {

                return res.status(200).json({
                    success: true,
                    notifications: notifications,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: "No notification yet!",
                });
            }

        } catch (error) {
            return res.status(500).json({
                error: 'An error occurred while fetching notifications.'
            });
        }
    },

}