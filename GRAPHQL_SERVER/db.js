
import { Sequelize, DataTypes, Model } from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    // storage: './GOAT_products.db'
    // storage: './raw_products.db'
    storage: './products.db'
});

const connectToDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

};

const createTables = async () => {
    await sequelize.sync();
    // await sequelize.sync();
    // console.log("All models were synchronized successfully.");
    // Code here
};

const syncTables = async () => {
    await sequelize.sync();
    // await Product.sync()
    // await Product_Image.sync()
    // await Product_Additional_Info.sync()
    // await sequelize.sync();
    // console.log("All models were synchronized successfully.");
    // Code here
};

class Product extends Model { }
class Product_Image extends Model { }
// class Product_Additional_Info extends Model { }

Product.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Model attributes are defined here
    product_name: {
        type: DataTypes.TEXT,
        // allowNull: false
    },
    product_sub_title: {
        type: DataTypes.TEXT,
        // allowNull: false
    },
    product_description: {
        type: DataTypes.TEXT,
        // allowNull: false
    },
    main_category: {
        type: DataTypes.TEXT,
        // allowNull: false
    },
    sub_category: {
        type: DataTypes.TEXT,
        // allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2), // max value 99,999,999.99
        type: DataTypes.TEXT,
        // allowNull: false
        // type: DataTypes.TEXT,
        // get() {
        //     const rawValue = this.getDataValue('price'); // format: £44.4
        //     console.log(rawValue);
        //     const priceWithoutSign = rawValue.slice(1)
        //     return Number(priceWithoutSign);
        // }
        // allowNull defaults to true
    },
    link: {
        type: DataTypes.TEXT,
        // allowNull: false
    },
    overall_rating: {
        // type: DataTypes.TEXT,
        type: DataTypes.DECIMAL(2, 1), // max rating 5.0
    }
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Product', // We need to choose the model name,
    tableName: 'products',
    timestamps: false,
});

Product_Image.init({
    // Model attributes are defined here
    product_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        // allowNull: false,
        references: {
            // This is a reference to another model
            model: Product,
            // This is the column name of the referenced model
            key: 'id',
        },
    },
    image_url: {
        type: DataTypes.TEXT,
        // allowNull: false
    },
    alt_text: {
        type: DataTypes.TEXT,
        // allowNull: false
    },
    additional_info: {
        type: DataTypes.TEXT,
    }
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Product_Image', // We need to choose the model name,
    tableName: 'product_images',
    timestamps: false,
});

// Product_Additional_Info.init({
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     // Model attributes are defined here
//     product_id: {
//         type: DataTypes.INTEGER,
//         // allowNull: false,
//         references: {
//             // This is a reference to another model
//             model: Product,
//             // This is the column name of the referenced model
//             key: 'id',
//         },
//     },
//     choices: {
//         type: DataTypes.TEXT,
//         // allowNull: false
//     },
//     additional_info: {
//         type: DataTypes.TEXT,
//     }
// }, {
//     // Other model options go here
//     sequelize, // We need to pass the connection instance
//     modelName: 'Product_Additional_Info', // We need to choose the model name,
//     tableName: 'product_additional_info',
//     timestamps: false,
// });

// the defined model is the class itself
// console.log(Product === sequelize.models.Product); // true


// Might be useful later
/*
class User extends Model {
    static classLevelMethod() {
      return 'foo';
    }
    instanceLevelMethod() {
      return 'bar';
    }
    getFullname() {
      return [this.firstname, this.lastname].join(' ');
    }
  }
  User.init({
    firstname: Sequelize.TEXT,
    lastname: Sequelize.TEXT
  }, { sequelize });
  
  console.log(User.classLevelMethod()); // 'foo'
  const user = User.build({ firstname: 'Jane', lastname: 'Doe' });
  console.log(user.instanceLevelMethod()); // 'bar'
  console.log(user.getFullname()); // 'Jane Doe'

  */
// (async () => {
//     try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//     } catch (error) {
//     console.error('Unable to connect to the database:', error);
//     }

// })();



// (async () => {
//     await sequelize.sync({ force: true });
//     console.log("All models were synchronized successfully.");
//     // Code here
// })();


// export { sequelize, connectToDB, createTables, syncTables, Product, Product_Image, Product_Additional_Info };
export { sequelize, connectToDB, createTables, syncTables, Product, Product_Image };


    // id
// product_name
// product_sub_title
// product_description
// main_category
// sub_category
// price
// link
// overall_rating

// additional_info: Just a free column. For instance, it could be used to indicate if it is the main photo or part of a gallery.
// ==============
// product_images
// ==============
// product_id
// image_url
// alt_text
// additional_info (VARCHAR)



// choices: allows adding rows for choices related to the product such as: size, quantity, colors.
// additional_info: Just a free column. For instance, it could be used to indicate availability among the choices.
// ==============
// products_additional_info
// ==============
// product_id
// choices (VARCHAR)
// additional_info
