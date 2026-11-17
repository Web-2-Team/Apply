const db = require("../config/mysql");
const conn = db.init();
db.connect(conn);

function projectCreate(req, res) {
    conn.query("INSERT INTO table_project (project-id, user-id) VALUES ()", function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send("조회 실패");
        }
        res.send(result);
    });
};

module.exports = { projectCreate };
