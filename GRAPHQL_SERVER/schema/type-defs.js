import { gql } from "apollo-server"

const typeDefs = gql`
    type Product {
        id: ID!
        product_name: String
        product_sub_title: String
        product_description: String
        main_category: String
        sub_category: String
        price: String
        link: String
        overall_rating: Float
        product_images: [Product_Image]
    }

    type Product_Image {
        product_id: ID!
        image_url: String
        alt_text: String
        additional_info: String

    }


    type Query {
        products: [Product!]!
        product(id: ID!): Product
        findProducts(search_string: String!): [Product!]
        filterProducts(input: filterProductsInput!): [Product!]
        findAndFilterProducts(input: findAndFilterProductsInput!): [Product!]

    }
    
    input filterProductsInput {
        main_category: [String!]
        sub_category: [String!]
        startPrice: Float
        endPrice: Float
        startRating: Float
        endRating: Float
    }
    
    input findAndFilterProductsInput {
        search_string: String
        main_category: [String!]
        sub_category: [String!]
        startPrice: Float
        endPrice: Float
        startRating: Float
        endRating: Float
    }

`;

export { typeDefs };
