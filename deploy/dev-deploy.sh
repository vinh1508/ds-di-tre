#!/usr/bin/env bash

aws s3 sync workspace/build s3://$DEV_S3_BUCKET/risk-report --delete --cache-control max-age=0,public --acl public-read
aws s3 sync workspace/build_static s3://$DEV_S3_BUCKET/risk-report/static --delete --cache-control max-age=31536000,public --acl public-read

aws configure set preview.cloudfront true

INVALIDATION_ID=$(date +"%Y%m%d%H%M%S")
INVALIDATION_JSON="{
    \"Paths\": {
        \"Quantity\": 1,
        \"Items\": [
            \"/risk-report/*\"
        ]
    },
    \"CallerReference\": \"$INVALIDATION_ID\"
}"
aws cloudfront create-invalidation --invalidation-batch "$INVALIDATION_JSON" \
                                    --distribution-id "$DEV_CLOUDFRONT_DISTRIBUTION_ID"
                                    
sleep 20
exit 0
