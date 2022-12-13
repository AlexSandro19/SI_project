const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
require("dotenv").config();
const fs = require("fs")
const getStream = require('into-stream');
const containerName = 'ftp';



let currentBlobLastModifiedOn = null;
const createBlobInContainer = async (containerClient,file) => {
  
    // create blobClient for container
    const blobClient = containerClient.getBlockBlobClient("products.db");
    console.log("getting the blob")
    // set mimetype as determined from browser with file upload control
    //const options = { blobHTTPHeaders: { blobContentType: file.type } };
    // upload file
    const response = await blobClient.uploadFile(file)
    console.log("response", response)
    /*const stream = getStream(file)
    await blobClient.uploadStream(stream, stream.lenght).catch(
      (err) => {
        if (err) {
          console.log(err);
        }
      })*/
  }

const uploadFileToBlob = async (file) => {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;
    console.log(accountKey)
    console.log(accountName)
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
    const blobService = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
      );
    const containerName = "ftp";
    // get Container - full public read access
    const containerClient = blobService.getContainerClient(containerName);
    
  
    // upload file
    try {
      console.log("before creating blob in container")
      await createBlobInContainer(containerClient, file);
    }catch(e){
      console.log(e)
    }
  
    // get list of blobs in container
  };
 function stream2buffer(stream) {

    return new Promise((resolve, reject) => {

        const _buf = [];

        stream.on("data", (chunk) => _buf.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(_buf)));
        stream.on("error", (err) => reject(err));

    });
}

    module.exports = uploadDocumentToAzure = async () => {
        const data = "./ftproot/products.db"
        console.log("inside call finc")
        if(fs.existsSync(data)){
          const response = await uploadFileToBlob(data);
        }
        //const blockBlobClient = container.getBlockBlobClient("products.db");
        
    };

    

         