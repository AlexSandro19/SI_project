const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    // const name = (req.query.name || (req.body && req.body.name));
    // const responseMessage = name
    //     ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    //     : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";
    try {
        const { url, hostname } = req.body
        context.log(req.body)
        if (url && hostname) {
            const isUploaded = await uploadDataToStorage({ url, hostname }, context)
            if (isUploaded) {
                context.res = {
                    status: 200,
                    body: { success: true, message: "Success" }
                }
            } else {
                context.res = {
                    status: 500,
                    body: { success: false, message: "An internal server error occurred" }
                }
            }
        } else {
            context.res = {
                status: 400,
                body: { success: false, message: "All the fields have to be provided" }
            }
        }
        // fs.readFile('urls.json','utf8',(err,data)=>{
        //     if(err){
        //         return res.status(500).json({message:"An internal error occurred"})
        //     }
        //     const obj = JSON.parse(data)
        //     obj.tableOfUrls.push({hostname:hostname,url:url})
        //     json = JSON.stringify(obj); //convert it back to json
        //     fs.writeFile('myjsonfile.json', json, 'utf8'); // write it back 
        // });

        // context.res = {
        //     status: 200,
        //     body: { success: true, message: "Success" }
        // }
    } catch (error) {
        context.log(error)
        context.res = {
            status: 500,
            body: { success: false, message: "An internal server error occurred" }
        }
    }
}

async function uploadDataToStorage(data, context) {
    try {
        const finalData = { urls: [] };
        context.log("Azure Blob storage v12 - JavaScript quickstart sample");

        const accountName = process.env["AZURE_STORAGE_ACCOUNT_NAME"];
        const accountKey = process.env["AZURE_STORAGE_ACCOUNT_ACCESS_KEY"];
        if (!accountName) throw Error('Azure Storage accountName not found');

        // const connStr = process.env["AZURE_STORAGE_CONNECTION_STRING"];
        // const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);

        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
        const storageAccount = new BlobServiceClient(
            `https://${accountName}.blob.core.windows.net`,
            sharedKeyCredential
        );

        const containerName = "subscribe-endpoint";

        // Get a reference to a container
        const container = storageAccount.getContainerClient(containerName);

        const containerExist = await container.exists()
        if (!containerExist) {
            const createContainerResponse = await container.create();
            context.log(
                `Container "${container.containerName}" was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`
            );
        } else {
            context.log('Reference received for container:', containerName);
        }

        // const blobName = "GOAT_products.db";
        const blobName = "urls.json";

        const urlsFile = container.getBlockBlobClient(blobName);
        const urlsFileExists = await urlsFile.exists()
        if (urlsFileExists) {
            const urlsFileProperties = await urlsFile.getProperties()
            if (urlsFileProperties?.contentLength != 0) {
                const downloadUrlsFileResponse = await urlsFile.download(0);
                const existingDataAsString = await streamToText(downloadUrlsFileResponse.readableStreamBody)
                context.log(`${urlsFile.name} file has some initial data: ${existingDataAsString}`)
                const existingDataObject = JSON.parse(existingDataAsString)
                finalData.urls.push(...existingDataObject.urls, data)
            } else {
                context.log(`${urlsFile.name} file is empty`)
                finalData.urls.push(data)
            }
        } else {
            context.log(`${urlsFile.name} file doesnt exist`)
            finalData.urls.push(data)
        }

        context.log(`Final data that will be saved in ${urlsFile.name} is: ${JSON.stringify(finalData)}`);
        const uploadBlobResponse = await urlsFile.upload(JSON.stringify(finalData), JSON.stringify(finalData).length);
        context.log(
            `Blob "${urlsFile.name}" was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`
        );
        return true;

    } catch (err) {
        context.log(`Error: ${err}`);
        context.log(`Error message: ${err.details}`);
        context.log(`Error JSON: ${JSON.stringify(err)}`);
        return false
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