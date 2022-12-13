const { Model, Field } = require('neo4j-node-ogm')
const User = require('./user.js')
class Invite extends Model {
    constructor (values) {
      const labels = ['Invite']
      const attributes = {
  
        user_id: Field.String(),
        status: Field.String(),
        expiration: Field.Integer(),
        invited_email: Field.String({
          max_length: 255,
          required: true
        }),
        token: Field.Hash(),
        created_at: Field.DateTime({
          default: new Date()
        }),
        // role: Field.Relationship({
        //   labels: ['HAS_ROLE'],
        //   target: Role
        // }),
        sender: Field.Relationships({
          labels: ['SENDS'],
          target: User,
          attributes: {
            intimacy: Field.String()
          }
        }),
        receiver: Field.Relationships({
            labels: ['WAS_INVITED'],
            target: User,
            attributes: {
              intimacy: Field.String()
            }
          })
      }
      super(values, labels, attributes)
    }

}
module.exports=Invite