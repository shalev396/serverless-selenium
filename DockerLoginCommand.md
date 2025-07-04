# Docker ECR Login Commands

This file contains example commands for logging into AWS ECR (Elastic Container Registry) to push/pull Docker images.

## Prerequisites

- AWS CLI configured with appropriate permissions
- Docker installed and running
- ECR repository created in your AWS account

## Login Commands

Replace the placeholder values with your actual AWS configuration:

```powershell
# PowerShell - Get login token and authenticate Docker with ECR
$password = aws ecr get-login-password --region <YOUR_AWS_REGION>
docker login --username AWS --password $password <YOUR_ACCOUNT_ID>.dkr.ecr.<YOUR_AWS_REGION>.amazonaws.com
```

```bash
# Bash - Alternative login method
aws ecr get-login-password --region <YOUR_AWS_REGION> | docker login --username AWS --password-stdin <YOUR_ACCOUNT_ID>.dkr.ecr.<YOUR_AWS_REGION>.amazonaws.com
```

## Configuration Variables

| Variable            | Description         | Example                        |
| ------------------- | ------------------- | ------------------------------ |
| `<YOUR_AWS_REGION>` | Your AWS region     | `us-east-1`, `eu-west-1`, etc. |
| `<YOUR_ACCOUNT_ID>` | Your AWS account ID | `123456789012`                 |

## Notes

- This login session is valid for 12 hours
- Make sure your AWS credentials have ECR permissions
- The repository must exist before pushing images
- For production use, consider using IAM roles instead of credentials
