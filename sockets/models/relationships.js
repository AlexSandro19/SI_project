const driver = require('neo4j-driver')
const {connection} = require('../db')
/**
 * The node objects Neo4jNodeObject are objects created by the neo4j-node-ogm module we use
 * @param {Neo4jNodeObject} node1 The node which starts the relationships
 * @param {Neo4jNodeObject} node2 The node to which the relationships is connected to
 * @param {String} typeOfRelationship String value of the type of relationship
 * @returns {Boolean} True or False if the relationship creation succeeded
 */
async function create(node1,node2,typeOfRelationship){
    let success = false;
    console.log(node1._labels[0]);
    console.log(node2._labels[0]);
    const session = connection()
    .run(`Match (n:${node1._labels[0]}),(m:${node2._labels[0]}) where id(n)=${node1.id} and id(m)=${node2.id}  CREATE(n)-[r:${typeOfRelationship}]->(m) return r`).then(result => {
        result.records.forEach(record => {
          console.log(record.get('r'))
        })
        success=true;
      })
      .catch(error => {
        console.log(error)
        success = false;
      })
      return success
    }

module.exports ={
    create
}