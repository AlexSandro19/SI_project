const jwt = require('jsonwebtoken');
require("dotenv").config();
async function linkGenerator(id, receiver_email, inviter_email) {
    return jwt.sign({
        receiver_email,
        id,
        inviter_email
    }, process.env.SECRET_KEY)
}
async function decodeLink(token) {
    return jwt.verify(token, process.env.SECRET_KEY)
}
module.exports = {
    linkGenerator,
    decodeLink
}
