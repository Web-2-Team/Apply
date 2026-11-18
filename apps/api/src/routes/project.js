const router = require("express").Router();

const { projectCreate } = require("../controllers/project-create");
const { projectReadAll, projectReadDetail } = require("../controllers/project-read");
const { projectUpdate } = require("../controllers/project-update");

router.post("/create", projectCreate)
router.get("/read", projectReadAll)
router.get("/read/:projectId", projectReadDetail)
router.put("/update/:projectId", projectUpdate)

module.exports = router;