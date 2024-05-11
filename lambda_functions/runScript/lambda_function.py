import os
import boto3

AMI = os.environ['AMI']
INSTANCE_TYPE = os.environ['INSTANCE_TYPE']
REGION = os.environ['REGION']
BUCKET_NAME = os.environ['BUCKET_NAME']
TABLE_NAME = os.environ['TABLE_NAME']
EC2_IAM_ROLE = os.environ['EC2_IAM_ROLE']

def lambda_handler(event, context):
    
    for record in event['Records']:
        
        # Trigger for dynamodb INSERT event
        if record['eventName'] == 'INSERT':
            ec2_client = boto3.client('ec2', region_name=REGION)
            
            id = record['dynamodb']['NewImage']['id']['S']
            
            init_script = f"""#!/bin/bash
                            sudo su
                    
                            yum install -y python3-pip
                    
                            pip3 install boto3
                            
                            id={id}
                            region_name={REGION}
                            bucket_name={BUCKET_NAME}
                            table_name={TABLE_NAME}

                            aws s3 cp s3://{BUCKET_NAME}/script.py script.py
                            
                            python3 script.py $id $region_name $bucket_name $table_name
                            
                            shutdown -h now
                            """
            
            # run ec2 instance with necessary
            response = ec2_client.run_instances(
                ImageId=AMI,
                InstanceType=INSTANCE_TYPE,
                MaxCount=1,
                MinCount=1,
                InstanceInitiatedShutdownBehavior='terminate',
                UserData=init_script,
                IamInstanceProfile={
                    'Arn': EC2_IAM_ROLE,
                    },
                Monitoring={
                    'Enabled': True
                    },
                )
        
            instance_id = response['Instances'][0]['InstanceId']
            
            print(f'Started EC2 instance and executed script successfully: {instance_id}')
            
            return {
                'statusCode': 200,
                'body': f'Started EC2 instance and executed script successfully: {instance_id}'
            }
        
        return {
            'statusCode': 500,
            'body': 'No INSERT event found'
        }