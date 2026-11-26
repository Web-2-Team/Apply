const bcrypt = require('bcrypt');

const db = require("../config/mysql");
const conn = db.init();
db.connect(conn);

const hashing = require("../../utils/hashing");

async function signin(req,res){
    const new_user = req.body;
    
    //비밀번호 혜싱
    const hashed = await bcrypt.hash(new_user.password, 13);


    conn.query(
        "INSERT INTO table_user (name, email, password, major, number) VALUES (?, ?,?,?,?)",
        [new_user.name,new_user.email,hashed,new_user.major,new_user.number],
        function(err, re){
            conn.query(
    "INSERT INTO table_user (name, email, password, major, number) VALUES (?, ?, ?, ?, ?)",
    [
        new_user.name,
        new_user.email,
        hashed,
        new_user.major,
        new_user.number
    ],
    function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "회원가입 실패"
            });
        }

        return res.status(201).json({
            message: "회원가입 성공"
        });
    }
);
        }
    );
}

