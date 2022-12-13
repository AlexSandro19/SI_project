import { productSchema, getAllProducts, getProduct,findProducts, filterProducts, findAndFilterProducts, getProductImages } from "../redis.js"
import _ from "lodash"

const resolvers = {
    Query: {
        // User resolvers
        products: async () => {
            const allProducts = await getAllProducts()
            // const updated = allProducts.map(async (product, index) => {
            //     // console.log("product instanceof Product: ", product instanceof Product);

            //     product.product_images = await Product_Image.findAll()
            //     // console.log("Product Images: ", product.product_images);
            //     console.log("Product: ", JSON.stringify(product, null, 2));

            // })
            // console.log("All products: ", JSON.stringify(allProducts, null, 2));
        
            return allProducts;
        },
        findProducts: async (parent, args) => {
            const search_string = args.search_string
            // console.log("search_string: ", search_string);
            const products = await findProducts(search_string)
            // console.log("Product: ", JSON.stringify(product, null, 2));
            return products;
        },
        filterProducts: async (parent, args) => {
            const {main_category, sub_category, startPrice, endPrice, startRating, endRating} = args.input
            // console.log("args.input: ", args.input);
            const products = await filterProducts(main_category, sub_category, startPrice, endPrice, startRating, endRating)
            // console.log("Product: ", JSON.stringify(product, null, 2));
            return products;
        },
        findAndFilterProducts: async (parent, args) => {
            const {search_string, main_category, sub_category, startPrice, endPrice, startRating, endRating} = args.input
            // console.log("args.input: ", args.input);
            const products = await findAndFilterProducts(search_string, main_category, sub_category, startPrice, endPrice, startRating, endRating)
            // console.log("Product: ", JSON.stringify(product, null, 2));
            return products;
        },

        product: async (parent, args) => {
            const id = Number(args.id)
            const product = await getProduct(id)
            // console.log("Product: ", JSON.stringify(product, null, 2));
            return product;
        },


        // example of the structure for user
        // query -> user -> favoriteMovies
        // query is the parent of user and user is the parent of favoriteMovies
        // user: (parent, args, context, info) => {
        //     // console.log(parent) // since the parent is query, we will get undefined because query doesnt return anything
        //     // console.log(context)
        //     // console.log(context.req.headers)
        //     console.log(info) // general info about the graphql query that we called
        //     const id = args.id;
        //     user = _.find(UserList, { id: Number(id) });
        //     return user;
        // },

        // // Movie resolvers
        // movies: () => {
        //     return MovieList;
        // },
        // movie: (parent, args) => {
        //     const name = args.name;
        //     movie = _.find(MovieList, { name });
        //     return movie;
        // }

    },

    Product: {
        product_images: async (parent) => {
            // console.log(parent);
            // const product = Product.build({...parent.schemaDef.id}) // returns the products to which product_images should belong
            // not sure if I should have built the entire product object if I use only the id, but anyway
            // console.log("Product in graphql: ", product instanceof Product);
            // product.product_images = await Product_Image.findAll({
            //                                     where: {
            //                                         product_id: product.id
            //                                     }
            //                                 })

            const parent_id = parent.id
            // console.log("parent_id: ", parent_id);
            const product_images = await getProductImages(parent_id)
            // console.log("Product in graphql: ", product_images);
            return product_images;
            // await Promise.all(allProducts.map(async (product) => {
            //     product.product_images = await Product_Image.findAll({
            //         where: {
            //           product_id: product.id
            //         }
            //       })
            //     return product;
    
            //     // NEED TO HANDLE ERRORS (if course is not found for example, etc.)
            // }));
    
            // console.log(parent); // this will return the whole user (with all the properties specified in the type-defs.js (user, username, age, nationality, friends, favoriteMovies))
        }
    },

};

export { resolvers };