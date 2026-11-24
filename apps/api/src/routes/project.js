const router = require("express").Router();

const { projectCreate } = require("../controllers/project-create");
const { projectReadAll, projectReadDetail } = require("../controllers/project-read");
const { projectUpdate } = require("../controllers/project-update");
const { projectDelete } = require("../controllers/project-delete");
const { projectApply } = require("../controllers/project-apply");

router.post("/create", projectCreate)
router.get("/read", projectReadAll)
router.get("/read/:projectId", projectReadDetail)
router.put("/update/:projectId", projectUpdate)
router.delete("/delete/:projectId", projectDelete)
router.post("/apply/:projectId", projectApply)

module.exports = router;