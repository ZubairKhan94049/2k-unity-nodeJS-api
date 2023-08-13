const NotificationsController = require("../controllers/notificationsController");


const express = require("express");
const router = express.Router();

router.post("/send-notification", NotificationsController.send_notification);
router.get("/:userID", NotificationsController.get_all_notifications_of_user_by_id);

module.exports = router;