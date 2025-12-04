# Ocean Prime Website Deployment Guide

This guide provides all the necessary steps to deploy the Ocean Prime website on a clean Ubuntu 22.04 server.

---

## 1. Server Preparation

These commands need to be run on your server.

### 1.1. Install Docker and Docker Compose

```bash
# Update package lists
sudo apt update

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 1.2. Configure Firewall (UFW)

These commands will secure your server by only allowing necessary traffic.

```bash
# Allow SSH connections (so you don't get locked out)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS traffic
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable the firewall
sudo ufw --force enable

# Check the status
sudo ufw status
```

---

## 2. Project Setup

Now, set up the project files on your server.

### 2.1. Clone the Project

First, you need to upload this project to a Git repository (like GitHub or GitLab).

Then, on your server, create a directory and clone the repository into it.

```bash
# Create the directory
sudo mkdir -p /var/www/ocean-prime

# Change ownership to your user (replace 'your_user' with your actual username)
sudo chown -R your_user:your_user /var/www

# Clone the project (replace the URL with your repository's URL)
git clone https://github.com/your-repo/ocean-prime.git /var/www/ocean-prime

# Navigate into the project directory
cd /var/www/ocean-prime
```

### 2.2. Create Environment File

Copy the example environment file and fill in your details.

```bash
# Copy the file
cp .env.example .env

# Open the file in a text editor (like nano)
nano .env
```

You need to set the `DOMAIN` to your actual domain name and `LETSENCRYPT_EMAIL` to your email address.

### 2.3. Set Permissions for Traefik

This file will store your SSL certificates, so it needs to be secure.

```bash
# Ensure the file exists
touch traefik/acme.json

# Set restrictive permissions
chmod 600 traefik/acme.json
```

---

## 3. Deployment

You are now ready to launch the website.

### 3.1. First Deployment

From the project directory (`/var/www/ocean-prime`) on your server, run the following command:

```bash
docker compose up -d --build
```

Your website should now be live at your domain. Traefik will automatically obtain an SSL certificate for you.

### 3.2. Subsequent Deployments

For future updates, you can use the `deploy.sh` script from your **local machine**.

First, make sure the script is executable:
```bash
chmod +x deploy.sh
```

Then, simply run it after making your changes:
```bash
./deploy.sh
```

The script will push your changes to Git and automatically update the application on your server.
