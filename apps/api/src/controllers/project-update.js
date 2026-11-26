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
            const projectId = req.params.projectId;
            conn.query("DELETE FROM table_spec WHERE `project-id` = ? ",
                [projectId],
                function (err, result) {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("수정 실패");
                    }
                });

            const specs = Object.entries(req.body.spec ?? {});
            const specSize = specs.map(() => "(?, ?, ?)").join(", ");
            const specValues = specs.flatMap(
                ([name, size]) => [projectId, name, size])
            conn.query("INSERT INTO table_spec (`project-id`, `spec-name`, `spec-size`) VALUES " + specSize,
                specValues,
                function (err, result) {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("수정 실패");
                    }
                    res.send(result);
                }
            );
        }
    );
}

module.exports = { projectUpdate };
