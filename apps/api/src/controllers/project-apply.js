const db = require("../config/mysql");
const conn = db.init();
db.connect(conn);

function projectApply(req, res) {
    conn.query("INSERT INTO table_applied_project (`project-id`, `user-id`, `is-passed`, `spec-name`) VALUES (?, ?, NULL, ?)",
        [req.params.projectId, req.body.userId, req.query.spec],
        function (err, result) {
            if (err) {
                console.error(err);
                return res.status(500).send("신청 실패");
            }
            res.send(result);
        }
    );
}

module.exports = { projectApply };
