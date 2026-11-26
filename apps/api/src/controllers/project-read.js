const db = require("../config/mysql");
const conn = db.init();
db.connect(conn);

function projectReadAll(req, res) {
    conn.query("SELECT * FROM table_project", function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send("조회 실패");
        }
        res.send(result);
    });
}

function projectReadDetail(req, res) {
    conn.query("SELECT * FROM table_project WHERE `project-id` = ?", [req.params.projectId], function (err, readResult) {
        if (err) {
            console.error(err);
            return res.status(500).send("프로젝트 조회 실패");
        }


        conn.query("SELECT * FROM table_spec WHERE `project-id` = ?", [req.params.projectId], function (err, result) {
            if (err) {
                console.error(err);
                return res.status(500).send("직군 조회 실패");
            }

            res.json({
                project: readResult,
                spec: result
            });
        });
    });
}

module.exports = { projectReadAll, projectReadDetail };
