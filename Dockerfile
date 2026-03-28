# ==============================================================================
# Serverless Selenium Lambda Container
# 
# Multi-stage Docker build for running Selenium WebDriver with headless Chrome
# in AWS Lambda environment. This container supports multiple Lambda functions
# using the same base image.
# 
# Architecture:
# - Stage 1: Download and extract Chrome/ChromeDriver binaries
# - Stage 2: Create minimal runtime image with Lambda base
# 
# ==============================================================================

# ------------------------------------------------------------------------------
# BUILD STAGE: Chrome and ChromeDriver Binary Preparation
# ------------------------------------------------------------------------------
FROM public.ecr.aws/lambda/nodejs:latest as build

# Install required tools for downloading and extracting binaries
RUN dnf install -y unzip && \
    # Download Chrome and ChromeDriver binaries from Google's testing repository
    # Using specific version (131.0.6778.204) for consistency and reliability
    curl -Lo "/tmp/chromedriver-linux64.zip" "https://storage.googleapis.com/chrome-for-testing-public/131.0.6778.204/linux64/chromedriver-linux64.zip" && \
    curl -Lo "/tmp/chrome-linux64.zip" "https://storage.googleapis.com/chrome-for-testing-public/131.0.6778.204/linux64/chrome-linux64.zip" && \
    # Extract binaries to /opt directory
    unzip /tmp/chromedriver-linux64.zip -d /opt/ && \
    unzip /tmp/chrome-linux64.zip -d /opt/

# ------------------------------------------------------------------------------
# RUNTIME STAGE: Lambda Environment Setup
# ------------------------------------------------------------------------------
FROM public.ecr.aws/lambda/nodejs:latest

# Install required system dependencies for Chrome browser
# These packages are essential for running headless Chrome in Lambda
RUN dnf install -y \
    # Core X11 and GTK libraries
    atk cups-libs gtk3 libXcomposite alsa-lib \
    # X11 cursor and damage extension libraries
    libXcursor libXdamage libXext libXi libXrandr libXScrnSaver \
    # Additional X11 and input libraries
    libXtst pango at-spi2-atk libXt \
    # Virtual display and authentication
    xorg-x11-server-Xvfb xorg-x11-xauth \
    # D-Bus libraries for inter-process communication
    dbus-glib dbus-glib-devel \
    # Network Security Services and graphics libraries
    nss mesa-libgbm

# Copy Chrome and ChromeDriver binaries from build stage
# This approach keeps the final image size minimal
COPY --from=build /opt/chrome-linux64 /opt/chrome
COPY --from=build /opt/chromedriver-linux64 /opt/

# Copy the pre-built application bundle
# Note: Application is built outside container using 'npm run build'
# This separation allows for faster builds and better caching
COPY dist/ ./

# Lambda reads ENV from serverless.yml at deploy time — no defaults in the image.

# ------------------------------------------------------------------------------
# Lambda Configuration Notes
# ------------------------------------------------------------------------------
# 
# This container is designed to work with multiple Lambda functions.
# The CMD is intentionally NOT specified here - instead, each function
# defines its own command in serverless.yml:
# 
# functions:
#   demo:
#     image:
#       name: selenium-image
#       command: ["handlers/main.handler"]
#   
#   test:
#     image:
#       name: selenium-image  
#       command: ["handlers/test.handler"]
# 
# This approach allows:
# - Single image for multiple functions
# - Efficient resource utilization
# - Simplified deployment pipeline
# - Reduced container registry storage
# ------------------------------------------------------------------------------
