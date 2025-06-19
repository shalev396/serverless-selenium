# Build stage for Chrome and ChromeDriver binaries
FROM public.ecr.aws/lambda/nodejs:latest as build
RUN dnf install -y unzip && \
    curl -Lo "/tmp/chromedriver-linux64.zip" "https://storage.googleapis.com/chrome-for-testing-public/137.0.7151.119/linux64/chromedriver-linux64.zip" && \
    curl -Lo "/tmp/chrome-linux64.zip" "https://storage.googleapis.com/chrome-for-testing-public/137.0.7151.119/linux64/chrome-linux64.zip" && \
    unzip /tmp/chromedriver-linux64.zip -d /opt/ && \
    unzip /tmp/chrome-linux64.zip -d /opt/

# Final Lambda runtime stage
FROM public.ecr.aws/lambda/nodejs:latest
RUN dnf install -y atk cups-libs gtk3 libXcomposite alsa-lib \
    libXcursor libXdamage libXext libXi libXrandr libXScrnSaver \
    libXtst pango at-spi2-atk libXt xorg-x11-server-Xvfb \
    xorg-x11-xauth dbus-glib dbus-glib-devel nss mesa-libgbm

# Copy Chrome and ChromeDriver binaries
COPY --from=build /opt/chrome-linux64 /opt/chrome
COPY --from=build /opt/chromedriver-linux64 /opt/

# Copy the pre-built application (built outside container with npm run build)
COPY dist/ ./

# Environment variable for default password (can be overridden)
ENV PASSWORD=default_password

# No CMD specified - handler will be configured per function in serverless.yml
# This allows the same image to be used for multiple Lambda functions
