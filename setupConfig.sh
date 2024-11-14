#!/bin/bash

# Default to development if NODE_ENV is not set
ENVIRONMENT=${NODE_ENV:-development}

# Determine which .env file to use
ENV_FILE=".env.$ENVIRONMENT"

# Check if the environment file exists
if [ ! -f $ENV_FILE ]; then
    echo "Error: $ENV_FILE does not exist."
    exit 1
fi

# Create or overwrite config.ts in the src directory
echo "export const config = {" > ./src/config.ts
cat $ENV_FILE | grep -v '^#' | grep -v '^$' | while read line || [[ -n $line ]];
do
    KEY=$(echo $line | cut -d '=' -f 1)
    VALUE=$(echo $line | cut -d '=' -f 2)

    # Remove leading and trailing quotes from the value
    CLEANED_VALUE=$(echo $VALUE | sed -e 's/^"//' -e 's/"$//')
    
    echo "  $KEY: '$CLEANED_VALUE'," >> ./src/config.ts
done
echo "};" >> ./src/config.ts

echo "config.ts has been generated based on $ENV_FILE"
