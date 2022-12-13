import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { v1 as uuidv1 } from 'uuid';
import { DefaultAzureCredential } from '@azure/identity';
import * as dotenv from 'dotenv'
dotenv.config()
import * as fs from 'fs';
import * as path from 'path';

let currentBlobLastModifiedOn = null;
async function downloadFileFromStorage() {
    // console.log("currentBlobLastModifiedOn: ", currentBlobLastModifiedOn)
    try {
        // console.log("Azure Blob storage v12 - JavaScript quickstart sample");

        const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
        const accountKey = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;
        if (!accountName) throw Error('Azure Storage accountName not found');

        // const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
        // const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);

        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
        const storageAccount = new BlobServiceClient(
            `https://${accountName}.blob.core.windows.net`,
            sharedKeyCredential
        );

        const containerName = "ftp";
        // console.log('\nCreating container...');
        // console.log('\t', containerName);

        // Get a reference to a container
        const container = storageAccount.getContainerClient(containerName);
        const containerExists = await container.exists()
        if (!containerExists) {
            console.log("container doesnt exist")
            return false;
        }
        // const blobName = "GOAT_products.db";
        const blobName = "products.db";

        const newBlob = container.getBlockBlobClient(blobName);
        const newBlobExists = await newBlob.exists()
        if (!newBlobExists) {
            console.log("blob file doesnt exist")
            return false
        }
        const newBlobProperties = await newBlob.getProperties()
        const newBlobLastModifiedOn = newBlobProperties.lastModified
        // console.log("currentBlobLastModifiedOn: ", currentBlobLastModifiedOn);
        // console.log("newBlobLastModifiedOn: ", newBlobLastModifiedOn);
        if ((currentBlobLastModifiedOn == null) || (currentBlobLastModifiedOn?.toString() != newBlobLastModifiedOn?.toString())) {
            const blobDownloadResponse = await newBlob.download();
            // console.log("downloadBlockBlobResponse: ", blobDownloadResponse);
            const isBlobDownloaded = await streamToFile(blobDownloadResponse.readableStreamBody);
            // console.log("Downloaded blob content:", isBlobDownloaded);

            currentBlobLastModifiedOn = newBlobLastModifiedOn
            // console.log("downloaded the new blob");
            // console.log("currentBlobLastModifiedOn: ", currentBlobLastModifiedOn);
            // console.log("newBlobLastModifiedOn: ", newBlobLastModifiedOn);
            return true;
        } else {
            // console.log("currentBlobLastModifiedOn: ", currentBlobLastModifiedOn);
            // console.log("newBlobLastModifiedOn: ", newBlobLastModifiedOn);
            return false;
        }

    } catch (err) {
        console.log(`Error: ${JSON.stringify(err.details)}`);
        console.log(`Error: ${JSON.stringify(err)}`);
    }
}

// downloadFileFromStorage()
//     .then(() => console.log("Done"))
//     .catch((error) => console.log(error.message));

async function streamToFile(readableStream) {
    const writableStream = fs.createWriteStream("./products.db");
    return new Promise((resolve, reject) => {
        readableStream.on('data', (chunk) => {
            writableStream.write(chunk);
        });
        readableStream.on("end", () => {
            writableStream.end();
            resolve(true);
        });
        readableStream.on("error", (err) => {
            console.log("streamToFile > error: ", err);
            reject(false)
        });
    });
}

export { downloadFileFromStorage }