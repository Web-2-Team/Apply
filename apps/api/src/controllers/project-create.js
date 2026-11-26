const db = require("../config/mysql");
const conn = db.init();
db.connect(conn);

function projectCreate(req, res) {
    conn.query("INSERT INTO table_project (`user-id`, title, subtitle, `desc`, deadline) VALUES (?, ?, ?, ?, ?)",
        [req.body.userId, req.body.title, req.body.subtitle, req.body.desc, req.body.deadline],
        function (err, result) {
            if (err) {
                console.error(err);
                return res.status(500).send("생성 실패");
            }

            const specs = Object.entries(req.body.spec ?? {});
            const specSize = specs.map(() => "(?, ?, ?)").join(", ");
            const specValues = specs.flatMap(
                ([name, size]) => [result.insertId, name, size])

            conn.query("INSERT INTO table_spec (`project-id`, `spec-name`, `spec-size`) VALUES " + specSize,
                specValues,
                function (err, result) {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("직군 생성 실패");
                    }
                    res.send(result);
                }
            );
        }
    );
}

module.exports = { projectCreate };
