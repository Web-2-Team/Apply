const router = require("express").Router();

const { projectCreate } = require("../controllers/project-create");
const { projectReadAll, projectReadDetail } = require("../controllers/project-read");

router.post("/create", projectCreate)
router.get("/read", projectReadAll)
router.get("/read/:projectId", projectReadDetail)

module.exports = router;