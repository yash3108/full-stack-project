import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { nanoid } from "nanoid";

let REGION = process.env.REGION;
let TABLE_NAME = process.env.TABLE_NAME;

const client = new DynamoDBClient({ region: REGION});

export const handler = (event) => {
  console.log(event.queryStringParameters);
  const { input_text, input_file_path } = event.queryStringParameters;
  
  const params = {
    TableName: TABLE_NAME,
    Item: marshall({
      id: nanoid(),
      input_text: input_text,
      input_file_path: input_file_path
    })
  };
  
  console.log(params);
  const command = new PutItemCommand(params);
  
  client.send(command).then(response => {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data saved successfully' })
    }
  }).catch(error => {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to save data' })
    }
  })
    
}
