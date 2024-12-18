#!/bin/bash

# Make script executable
chmod +x setup.sh

# Create necessary directories
mkdir -p public/assets/{css,js,img}
mkdir -p src
mkdir -p logs

# Set permissions
chmod -R 755 .
chmod -R 777 logs

# Create database
mysql -u root -p < database/schema.sql

# Install composer dependencies
composer install

echo "Setup completed successfully!"
