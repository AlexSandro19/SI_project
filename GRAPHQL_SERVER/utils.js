import jwt from 'jsonwebtoken';

const verifyJwt = (jwtToken, jwtKey, jwtOptions) => {
    return new Promise((resolve, reject) => {
        // console.log("jwtToken: ", jwtToken);
        // console.log("jwtKey: ", jwtKey);
        // console.log("jwtOptions: ", jwtOptions);
        jwt.verify(jwtToken, jwtKey, jwtOptions, function(err, decoded) {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
};

export {verifyJwt}