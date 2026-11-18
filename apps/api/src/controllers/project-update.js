const db = require("../config/mysql");
const conn = db.init();
db.connect(conn);

function projectUpdate(req, res) {
    conn.query("UPDATE table_project SET title = ?, subtitle = ?, `desc` = ?, deadline = ? WHERE `project-id` = ?",
        [req.body.title, req.body.subtitle, req.body.desc, req.body.deadline, req.params.projectId],
        function (err, result) {
            if (err) {
                console.error(err);
                return res.status(500).send("수정 실패");
            }
            res.send(result);
        }
    );
}

module.exports = { projectUpdate };
