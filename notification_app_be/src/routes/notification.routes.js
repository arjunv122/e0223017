import { Router } from "express";
import { getAllNotifications, getPriorityNotifications } from "../controllers/notification.controller.js";
import { backend as log } from "../../../logging_middleware/index.js";

const router = Router();

router.use((req, res, next) => {
  log.debug("route", `${req.method} ${req.baseUrl}${req.path}`);
  next();
});

router.get("/notifications", getAllNotifications);
router.get("/notifications/priority", getPriorityNotifications);

export default router;
