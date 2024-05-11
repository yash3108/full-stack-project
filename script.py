import sys
import boto3

# function to fecth item from dynamodb
def fetch_dynamodb(table_name, id, region_name):
    dynamodb = boto3.resource('dynamodb', region_name=region_name)
    table = dynamodb.Table(table_name)

    response = table.get_item(
        Key={
            'id': id
        }
    )

    if 'Item' in response:
        return response['Item']
    else:
        return None

# function to get file from s3 bucket
def read_s3(bucket_name, file_name):
    s3 = boto3.client('s3')

    response = s3.get_object(
        Bucket=bucket_name,
        Key=file_name
    )

    return response['Body'].read().decode('utf-8')

# function to put ouput file to s3 bucket 
def write_s3(bucket_name, file_name, content):
    s3 = boto3.client('s3')

    response = s3.put_object(
        Bucket=bucket_name,
        Key=file_name,
        Body=content.encode('utf-8')
    )

    return response

# function to update output file path to dynamodb table
def update_dynamodb(table_name, id, output_file_path, region_name):
    dynamodb = boto3.resource('dynamodb', region_name=region_name)
    table = dynamodb.Table(table_name)

    response = table.update_item(
        Key={
            'id': id
        },
        UpdateExpression='SET output_file_path = :path',
        ExpressionAttributeValues={
            ':path': output_file_path
        }
    )

    return response

def main():
    id = sys.argv[1]
    region_name = sys.argv[2]
    bucket_name = sys.argv[3]
    table_name = sys.argv[4]
    
    dynamodb_data = fetch_dynamodb(table_name, id, region_name)

    if dynamodb_data:
        input_text = dynamodb_data.get('input_text')
        input_file_path = dynamodb_data.get('input_file_path')

        file_content = read_s3(bucket_name, input_file_path.split('/')[1])

        output_file_content = file_content + ' : ' + input_text

        output_file_name = id + '_outputFile.txt' 

        output_file_path = bucket_name + '/' + output_file_name

        write_s3(bucket_name, output_file_name, output_file_content)

        update_dynamodb(table_name, id, output_file_path, region_name)

        print('Script Execution Complete')
    else:
        print('Record not found in dynamodb')

if __name__ == '__main__':
    main()