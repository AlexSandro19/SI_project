const fs = require('fs');
const xml2js = require('xml-js');
const xml = require('xml')
const cheerio = require('cheerio');
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

const buildFeed = (posts, item) => {
  const itemForFeed= {
    title:{_text:item.title},
    date:{_text:new Date().toISOString()},
    description:{_text:item.description}
  }
  posts.push(itemForFeed);
  const feedItems = [];
  const sortedPosts = posts.sort((first, second) => {
    return new Date(first.date._text).getTime() - new Date(second.date._text).getTime();
  });
  feedItems.push(
    ...sortedPosts.map((post) => {
      const feedItem = {
        title: post.title._text,
        date: new Date(post.date._text).toUTCString(),
        description: post.description._text,
      }
      return feedItem;
    })
  );
  return feedItems;
}
const createRssFeed = async (item) => {
  try {
    const accountName = process.env["AZURE_STORAGE_ACCOUNT_NAME"];
    const accountKey = process.env["AZURE_STORAGE_ACCOUNT_ACCESS_KEY"];

    if (!accountName) {throw Error('Azure Storage accountName not found');}
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const storageAccount = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );
    const containerName= 'rss-container'
    const container = storageAccount.getContainerClient(containerName);

    const containerExist = await container.exists()
    if (!containerExist) {
        const createContainerResponse = await container.create();
      
    } else {

    }
    const blobName='feed.xml'
    const feedFile=container.getBlockBlobClient(blobName);
    const feedFileExists = await feedFile.exists()
    if(feedFileExists){
      const feedFileProperties = await feedFile.getProperties()
      if(feedFileProperties?.contentLength != 0){
        const downloadFeedFile= await feedFile.download(0)
        const existingDataAsString = await streamToText(downloadFeedFile.readableStreamBody)

        const jsTransform = await xml2js.xml2js(existingDataAsString, {
          compact: true,
          spaces: 4
        })
       
        const builtFeed=await createTheFeed(jsTransform,item)
        const json = xml2js.xml2json(builtFeed,{
          compact: true,
          spaces: 4
        })
        const uploadBlobResponse = await feedFile.upload(builtFeed,builtFeed.length)
        return JSON.parse(json)
      }
    }
    else{
      throw Error('Internal Server Error');
    }
  }catch(err){
    console.log(err)
  }
 
}
async function streamToText(readable) {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
      data += chunk;
  }
  return data;
}
const createTheFeed = async(itemsObjects,item)=>{

  itemsObjects.rss.channel.item = buildFeed(itemsObjects.rss.channel.item, item)
  const feed = xml2js.js2xml(itemsObjects, {
    compact: true,
    ignoreComment: true,
    spaces: 4
  });

  return feed;
}
module.exports = async function (context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');

  // const name = (req.query.name || (req.body && req.body.name));
  // const responseMessage = name
  //     ? "Hello, " + name + ". This HTTP triggered function executed successfully."
  //     : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";
  try {
    const {
      item
    } = req.body
    if(item){
      const uploadedFeed = await createRssFeed(item)

      if(uploadedFeed){
        context.res = {
          // status: 200, /* Defaults to 200 */
          status: 200,
          body:uploadedFeed
        };
      }
      else {
        context.res = {
            status: 500,
            body: { success: false, message: "An internal server error occurred" }
        }
    }

    }else{
      return context.res = {
        status: 500,
        body: { success: false, message: "An item to append to the feed was not found" }
      }
    }
    
  } catch (e) {
    context.res = {
      status: 500,
      body: { success: false, message: "An internal server error occurred" }
  }
  }

}