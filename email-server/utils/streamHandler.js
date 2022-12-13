const {
    BlockBlobClient,BlobServiceClient, StorageSharedKeyCredential
  } = require('@azure/storage-blob');
  
async function streamToText(readable) {
    readable.setEncoding('utf8');
    let data = '';
    for await (const chunk of readable) {
        data += chunk;
    }
    return data;
}
module.exports=async()=>{

    const containerName = "subscribe-endpoint";
    const blobName = 'urls.json';
    const blobService = new BlockBlobClient(process.env.AZURE_STORAGE_ACCOUNT, containerName, blobName)
    const blobBuffer=await blobService.download(0)
    blobService.uploadFile()
    const blobToText = await streamToText(blobBuffer.readableStreamBody)
    const blobAsJSON = JSON.parse(blobToText)
    return blobAsJSON
}