'use strict';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let REGION = process.env.REGION;
let BUCKET_NAME = process.env.BUCKET_NAME;
let URL_EXPIRATION_SECONDS = process.env.URL_EXPIRATION_SECONDS;

const s3 = new S3Client({ REGION });

// Main Lambda entry point
export const handler = async (event) => {
  console.log(event)
  return await getUploadURL(event);
};

const getUploadURL = async function(event) {
  
  const Key = event.queryStringParameters.fileName;

  // Get signed URL from S3
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key,
    ContentType: 'text/plain',
  };

  console.log('Params: ', s3Params);
  const command = new PutObjectCommand(s3Params);
  const uploadURL = await getSignedUrl(s3, command, { expiresIn: URL_EXPIRATION_SECONDS});
  
  // s3 path for input file
  const path = BUCKET_NAME + '/' + Key;
  
  return JSON.stringify({
    uploadURL: uploadURL,
    Key,
    path
  });
}