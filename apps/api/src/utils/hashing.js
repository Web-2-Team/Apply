const bcrypt = require('bcrypt');

async function hashing(password){    
    //비밀번호 혜싱
    const hashed = await bcrypt.hash(password, 13);

    return password;
}