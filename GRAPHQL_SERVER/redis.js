import { Client, Entity, Schema, Repository } from 'redis-om'
import { Product as ProductDB, Product_Image as Product_ImageDB} from "./db.js"

const client = new Client()
const REDIS_URL = "redis://default:n1lzL8tmFigDpW0Hzem8z3ebPnMLRUIw@redis-10265.c250.eu-central-1-1.ec2.cloud.redislabs.com:10265"
await client.open(REDIS_URL)

class Product extends Entity { }
class Product_Image extends Entity { }

const productSchema = new Schema(Product, {
    id: { type: 'number' },
    product_name: { type: 'text', weight: 2 },
    product_sub_title: { type: 'text' },
    product_description: { type: 'string' },
    main_category: { type: 'string' },
    sub_category: { type: 'string' },
    price: { type: 'string' },
    link: { type: 'string' },
    overall_rating: { type: 'number' },
})

const ProductImageSchema = new Schema(Product_Image, {
    id: { type: 'number' },
    product_id: { type: 'number' },
    image_url: { type: 'string' },
    alt_text: { type: 'string' },
    additional_info: { type: 'string' },
})


const productRepository = client.fetchRepository(productSchema)
const productImageRepository = client.fetchRepository(ProductImageSchema)

async function storeAllProductDataInRedis() {
    const allProductsFromDB = await ProductDB.findAll()
    const allProductImagesFromDB = await Product_ImageDB.findAll()
    
    allProductsFromDB.forEach(async productFromDB => {
        const product = await productRepository.createAndSave({ ...productFromDB.dataValues })
    });
    allProductImagesFromDB.forEach(async productImageFromDB => {
        const product = await productImageRepository.createAndSave({ ...productImageFromDB.dataValues })
    });

    await productRepository.createIndex();
    await productImageRepository.createIndex();

    const allProductsFromRedisCount = await productRepository.search().return.count()
    const allProductImagesFromRedisCount = await productImageRepository.search().return.count()
    
    // console.log(`${allProductsFromRedisCount} products were added to Redis`);
    // console.log(`${allProductImagesFromRedisCount} images were added to Redis`);
    // console.log(`${allProductInfoFromRedisCount} products infos were added to Redis`);
    return {
        productsInRedis: allProductsFromRedisCount,
        productImagesInRedis: allProductImagesFromRedisCount,
       
    }

}

async function removeAllProductDataInRedis() {

    const products = await productRepository.search().return.all()
    const productsCount = products.length
    const productImages = await productImageRepository.search().return.all()
    const productImagesCount = productImages.length

    if (productsCount > 0) {
        const productIds = products.map(product => product.entityId)
        await productRepository.remove(productIds)
    }
    if (productImagesCount > 0) {
        const productImageIds = productImages.map(productImage => productImage.entityId)
        await productImageRepository.remove(productImageIds)
    }

    // console.log(`${productsCount} products were removed from Redis`);
    // console.log(`${productImagesCount} product images were removed from Redis`);
    // console.log(`${productInfoCount} product infos were removed from Redis`);
    return {
        productsRemovedFromRedis: productsCount,
        productImagesRemovedFromRedis: productImagesCount,

    }
}

async function getAllProducts() {

    return await productRepository.search().return.all()
}

async function getProductImages(product_id) {
    const productImages = await productImageRepository.search().where('product_id').eq(product_id).return.all()
    // console.log("getProductImages > productImages: ", productImages);
    return productImages

}


const filterByPrice = (startPrice, endPrice) => {
    // console.log("in filterByPrice");
    return search => search.where('price').greaterThanOrEqualTo(startPrice)
        .and('price').lessThanOrEqualTo(endPrice)
}

const filterByRating = (startRating, endRating) => {
    // console.log("in filterByRating");
    return search => search.where('overall_rating').greaterThanOrEqualTo(startRating)
        .and('overall_rating').lessThanOrEqualTo(endRating)
}

const searchByNameAndTitle = (search_string) => {
    // console.log("in searchByNameAndTitle");
    return search => search.where('product_name').match(`${search_string}`).or('product_name').match(`${search_string}*`)
        .or(search => search.where('product_sub_title').match(`${search_string}`).or('product_sub_title').match(`${search_string}*`))
}

async function findProducts(search_string = "") {
    const products = await productRepository.search().where(searchByNameAndTitle(search_string)).return.all()
    return products
}

async function filterProducts(main_category = [], sub_category = [],
    startPrice = 0, endPrice = Infinity, startRating = 0, endRating = 5) {

    // console.log("filterProducts, main_category:", main_category);
    // console.log("filterProducts, sub_category:", sub_category);
    // console.log("filterProducts, startPrice:", startPrice);
    // console.log("filterProducts, endPrice:", endPrice);
    // console.log("filterProducts, startRating:", startRating);
    // console.log("filterProducts, endRating:", endRating);

    let products = []

    if (startPrice || startRating) {
        // console.log("in (startPrice || startRating)");
        products = await productRepository.search().where(filterByPrice(startPrice, endPrice)).and(filterByRating(startRating, endRating)).returnAll()
    } else {
        products = await productRepository.search().return.all()
    }
    if (Array.isArray(main_category) && main_category.length) {
        // console.log("in main_category");
        const allFoundProductsByMainCategory = []
        main_category.forEach(category => {
            const filteredProductsByMainCategory = products.filter(product => product.main_category == category)
            allFoundProductsByMainCategory.push(...filteredProductsByMainCategory)
        })
        products = allFoundProductsByMainCategory
    }

    if (Array.isArray(sub_category) && sub_category.length) {
        // console.log("in sub_category");
        const allFoundProductsBySubCategory = []
        sub_category.forEach(category => {
            const filteredProductsBySubCategory = products.filter(product => product.sub_category == category)
            allFoundProductsBySubCategory.push(...filteredProductsBySubCategory)
        })
        products = allFoundProductsBySubCategory
    }
    return products

}



async function findAndFilterProducts(search_string = "", main_category = "", sub_category = [],
    startPrice = 0, endPrice = Infinity, startRating = 0, endRating = 5) {

    // console.log("findAndFilterProducts, main_category:", main_category);
    // console.log("findAndFilterProducts, sub_category:", sub_category);
    // console.log("findAndFilterProducts, startPrice:", startPrice);
    // console.log("findAndFilterProducts, endPrice:", endPrice);
    // console.log("findAndFilterProducts, startRating:", startRating);
    // console.log("findAndFilterProducts, endRating:", endRating);
    // console.log("findAndFilterProducts, search_string:", search_string);
    let products = []



    if (search_string && (startPrice || startRating)) {
        // console.log("in search_string && (startPrice || startRating)");
        products = await productRepository.search().where(searchByNameAndTitle(search_string))
            .and(filterByPrice(startPrice, endPrice)).and(filterByRating(startRating, endRating)).returnAll()

    } else if (search_string) {
        // console.log("in search_string");
        products = await productRepository.search().where(searchByNameAndTitle(search_string)).return.all()

    } else if (startPrice || startRating) {
        // console.log("in (startPrice || startRating)");
        products = await productRepository.search().where(filterByPrice(startPrice, endPrice)).and(filterByRating(startRating, endRating)).returnAll()
    } else {
        products = await productRepository.search().return.all()
    }
    if (Array.isArray(main_category) && main_category.length) {
        // console.log("findAndFilterProducts: in main_category");
        const allFoundProductsByMainCategory = []
        main_category.forEach(category => {
            const filteredProductsByMainCategory = products.filter(product => product.main_category == category)
            allFoundProductsByMainCategory.push(...filteredProductsByMainCategory)
        })
        products = allFoundProductsByMainCategory
    }
    if (Array.isArray(sub_category) && sub_category.length) {
        const allFoundProductsBySubCategory = []
        sub_category.forEach(category => {
            const filteredProductsBySubCategory = products.filter(product => product.sub_category == category)
            allFoundProductsBySubCategory.push(...filteredProductsBySubCategory)
        })
        products = allFoundProductsBySubCategory
    }
    return products
}

async function getProduct(id) {
    const product = await productRepository.search().where('id').eq(id).return.first()
    return product
}


export {
    storeAllProductDataInRedis, removeAllProductDataInRedis,
    productSchema, getAllProducts, getProduct,
    getProductImages,
    findProducts, filterProducts, findAndFilterProducts,
}