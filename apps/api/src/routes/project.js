const router = require("express").Router();

const { projectReadAll, projectReadDetail } = require("../controllers/project-read");

router.get("/read", projectReadAll)
router.get("/read/:projectId", projectReadDetail)

module.exports = router;