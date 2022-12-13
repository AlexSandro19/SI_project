const { Model, Field } = require('neo4j-node-ogm')

class User extends Model {
    constructor (values) {
      const labels = ['User']
      const attributes = {
        name: Field.String(),
        picture_path: Field.String(),
        email: Field.String({
          max_length: 255,
          required: true
        }),
        hash: Field.Hash(),
        created_at: Field.DateTime({
          default:new Date()
        }),
        // role: Field.Relationship({
        //   labels: ['HAS_ROLE'],
        //   target: Role
        // }),
        friends: Field.Relationships({
          labels: ['IS_FRIEND'],
          target: User,
          attributes: {
            intimacy: Field.String()
          }
        })
      }
      super(values, labels, attributes)
    }

}
module.exports=User