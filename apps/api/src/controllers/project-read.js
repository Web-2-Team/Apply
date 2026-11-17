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
};

function projectReadDetail(req, res) {
    conn.query("SELECT * FROM table_project WHERE project-id = ?", function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send("조회 실패");
        }
        res.send(result);
    });
};

module.exports = { projectReadAll, projectReadDetail };
