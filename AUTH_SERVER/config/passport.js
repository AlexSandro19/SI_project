const fs = require('fs');
const path = require('path');
const User = require("../models/user");
const JwtStrategy = require("passport-jwt").Strategy
const ExtactJwt = require("passport-jwt").ExtractJwt

const pathToKey = path.join(__dirname, '..', '/keys/id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const options = {
    jwtFromRequest: ExtactJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
    algorithms: ['RS256']
};

const strategy = new JwtStrategy(options, async (payload, done) => {
    // console.log("payload: ", payload);
    try {
        const user = User.findOne({ email: payload.sub })
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, null)
    }
})



module.exports = (passport) => {
    passport.use(strategy)
}

// const getMethods = (obj) => {
//   let properties = new Set()
//   let currentObj = obj
//   do {
//     Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
//   } while ((currentObj = Object.getPrototypeOf(currentObj)))
//   return [...properties.keys()].filter(item => typeof obj[item] === 'function')
// }