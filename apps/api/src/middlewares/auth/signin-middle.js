const db = require("../config/mysql");
const conn = db.init();
db.connect(conn);

function matchsignin(req, res, next){
    const input_data = req.body;

    if( typeof input_data.name !== 'string' || input_data.name === '' || 
        typeof input_data.number !== 'string' || input_data.name === '' ||
        typeof input_data.email !== 'string' || input_data.email === '' ||
        typeof input_data.password !== 'string' || input_data.password === '' ||
        typeof input_data.major !== 'string' || input_data.major === '' ||
        typeof input_data.name !== 'undefined' || input_data.name === '' || 
        typeof input_data.number !== 'undefined' || input_data.name === '' ||
        typeof input_data.email !== 'undefined' || input_data.email === '' ||
        typeof input_data.password !== 'undefined' || input_data.password === '' ||
        typeof input_data.major !== 'undefined' || input_data.major === ''
    ){
        conn.query(
            "SELECT * FROM table_user WHERE email = ?",
            [req.body.email],
            function (err, result) {
                if (err) {
                    console.error(err);
                    return res.status(500).send("조회 실패");
                }

                if (result.length > 0) {
                    return res.status(409).send("이미 존재하는 이메일");
                }
                next();
            }
        );

    }
    else{
        return res.status(400).send("누락된 항목이 있습니다.");
    }
}
module.exports = matchsignin;