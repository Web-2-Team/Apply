const db = require("../config/mysql");
const conn = db.init();
db.connect(conn);

function projectDelete(req, res) {
    conn.query("DELETE FROM table_project WHERE `project-id` = ?",
        [req.params.projectId],
        function (err, result) {
            if (err) {
                console.error(err);
                return res.status(500).send("삭제 실패");
            }
            res.send(result);
        }
    );
}

module.exports = { projectDelete };
