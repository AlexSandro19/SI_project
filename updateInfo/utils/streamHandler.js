const fs = require("fs");
const {
  BlockBlobClient
} = require('@azure/storage-blob');
const getStream = require('into-stream');
const containerName = 'image-container';
require("dotenv").config();
const getBlobName = (username) => {
  const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
  const idetifier1 = Math.random().toString().replace(/0\./, '');
  return `${username}-${identifier}-${idetifier1}.png`;
};

module.exports = async (req, res, next) => {
  try {
    const file = req.file
    const
      blobName = getBlobName(req.body.name.split(" ")[0] + "-" + req.body.name.split(" ")[1]),
      blobService = new BlockBlobClient(process.env.AZURE_STORAGE_STRING, containerName, blobName),
      stream = getStream(req.file.buffer),
      streamLength = req.file.buffer.length;
    blobService.uploadStream(stream, streamLength).catch(
      (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: err.message
          });
        }
      })
    req.blobName = blobName;

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      message: "File was not found or sent",
    });
  }
};