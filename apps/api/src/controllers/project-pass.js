const db = require("../config/mysql");
const conn = db.init();
db.connect(conn);

function projectPass(req, res) {
    conn.query("UPDATE table_applied_project SET `is-passed` = ? WHERE `project-id` = ? AND `user-id` = ?",
        [req.query.pass, req.params.projectId, req.params.userId],
        function (err, result) {
            if (err) {
                console.error(err);
                return res.status(500).send("합격 여부 결정 실패");
            }
            res.send(result);
        }
    );
}

module.exports = { projectPass };
