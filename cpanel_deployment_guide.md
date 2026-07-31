# cPanel Deployment Guide: Node.js & TypeScript Backend

This guide provides a comprehensive, step-by-step procedure to deploy your TypeScript-based Express backend to **cPanel (MilesWeb)** in the folder `lp-backend-landmaarkdeveloper-com`.

---

## 🏛️ Architecture Overview

On cPanel, Node.js applications are served using **Phusion Passenger**. Web requests are received by Apache/Nginx and forwarded to Passenger, which manages the Node.js application process.

```mermaid
graph TD
    Client[Web Browser / Frontend] -->|HTTP Requests| Apache[Apache / Nginx Web Server]
    Apache -->|Phusion Passenger| NodeApp[Node.js Process (app.js -> dist/index.js)]
    NodeApp -->|Prisma Client| DB[(MariaDB / MySQL Database)]
    NodeApp -->|Nodemailer| SMTP[SMTP Email Server]
```

---

## 🛠️ Step 1: Set Up the Database in cPanel

cPanel uses MySQL or MariaDB. You must create a new database and import the database schema.

1. **Log in to cPanel** on MilesWeb.
2. Search for and open the **MySQL Database Wizard**.
3. **Step 1: Create a Database**
   - Enter a name, e.g., `leaveportal` (the full name will be `cpanelusername_leaveportal`).
   - Click **Next Step**.
4. **Step 2: Create Database Users**
   - Enter a username, e.g., `dbuser` (the full name will be `cpanelusername_dbuser`).
   - Generate a strong password and save it securely.
   - Click **Create User**.
5. **Step 3: Add User to the Database**
   - Check the box for **ALL PRIVILEGES**.
   - Click **Make Changes** and proceed.
6. **Import the SQL Schema**
   - Go back to the cPanel Home and open **phpMyAdmin**.
   - Select your newly created database from the left panel.
   - Click the **Import** tab at the top.
   - Click **Choose File** and select the [leaveportal_db.sql](file:///c:/Users/stuti/backend_leaveportal/leaveportal_db.sql) file from your local workspace.
   - Click **Import** (or **Go**) at the bottom.

---

## 💻 Step 2: Prepare the Backend Locally

Before uploading, compile the TypeScript code and create a deployment package.

1. **Compile TypeScript**
   In your local project terminal, run the build command to generate the Javascript files:
   ```bash
   npm run build
   ```
   This creates a compiled folder `dist/` containing `index.js` and other routes/controllers.

2. **Create the Startup Wrapper**
   Passenger expects a startup file in the root folder. We have already created a root-level [app.js](file:///c:/Users/stuti/backend_leaveportal/app.js) file for you in this workspace, which routes requests to the compiled JS:
   ```javascript
   // app.js
   require('./dist/index.js');
   ```

3. **Zip the Project**
   Compress the project files into a single ZIP file (e.g., `backend.zip`).
   
   > [!WARNING]
   > **DO NOT** include the `node_modules` or `.git` directories in your ZIP file. Uploading `node_modules` compiled on Windows will cause database driver and crypt module errors on Linux.

   **Files to include in the ZIP:**
   - `dist/` (compiled javascript)
   - `prisma/` (contains schema.prisma)
   - `package.json`
   - `package-lock.json`
   - `app.js`

---

## 🚀 Step 3: Configure Setup Node.js App in cPanel

1. In cPanel, find the Software section and open **Setup Node.js App**.
2. Click the **Create Application** button.
3. Fill in the configuration details:
   - **Node.js version**: Choose a version matching your local environment (e.g., `20.x` or `18.x`).
   - **Application mode**: `Production`
   - **Application root**: `lp-backend-landmaarkdeveloper-com`
     *(This is the directory name relative to your home folder: `/home/cpanelusername/lp-backend-landmaarkdeveloper-com`)*
   - **Application URL**: Select the domain or subdomain (e.g., `lp-backend.landmaarkdeveloper.com`).
   - **Application startup file**: `app.js`
4. Click **Create** at the top-right.
   *(This launches a virtual environment and creates a basic dummy app in the background).*

---

## 📂 Step 4: Upload and Extract Files

1. Go to the cPanel **File Manager**.
2. Navigate to your application root directory: `/home/cpanelusername/lp-backend-landmaarkdeveloper-com`.
3. Select and **delete** the default dummy `app.js` created by cPanel.
4. Click **Upload** and upload the `backend.zip` file you prepared in Step 2.
5. Once uploaded, right-click `backend.zip` and select **Extract**. Extract files directly into the root folder.
6. Delete the `backend.zip` file to clean up disk space.

---

## ⚙️ Step 5: Configure Environment Variables

Create your production `.env` file to securely store database and SMTP credentials.

1. In cPanel File Manager, ensure you are inside `/home/cpanelusername/lp-backend-landmaarkdeveloper-com`.
2. Check if a `.env` file exists. If not, click **+ File** to create a file named `.env`.
3. Right-click `.env` and select **Edit**.
4. Add the following production variables:

```ini
# Production Database URL (MariaDB/MySQL)
DATABASE_URL="mysql://cpanelusername_dbuser:your_password@127.0.0.1:3306/cpanelusername_leaveportal?allowPublicKeyRetrieval=true"

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=premnankani99@gmail.com
SMTP_PASS="your-app-password"
FROM_EMAIL="Leave Portal <premnankani99@gmail.com>"
ADMIN_EMAIL=premnankani99@gmail.com
```

> [!NOTE]
> Make sure to replace `cpanelusername_dbuser`, `your_password`, and `cpanelusername_leaveportal` with the database details you configured in Step 1.

---

## ⚡ Step 6: Install Dependencies & Run Prisma

To compile the database drivers (`mysql2`/`mariadb`) and cryptography modules (`bcrypt`) for the cPanel Linux environment, you must install the dependencies on the server itself.

1. Go to cPanel **Setup Node.js App**.
2. Click **Edit** on your application.
3. At the top of the details panel, copy the virtual environment command. It looks like this:
   ```bash
   source /home/cpanelusername/nodevenv/lp-backend-landmaarkdeveloper-com/20/bin/activate && cd /home/cpanelusername/lp-backend-landmaarkdeveloper-com
   ```
4. Back in cPanel, search for and open the **Terminal** tool (if SSH access is enabled).
   *Note: If you do not have the Terminal tool in cPanel, you can connect to your server using an SSH client like PuTTY or Termius.*
5. Paste the copied command and press **Enter**. You are now in the Node.js environment.
6. Run the following commands:
   ```bash
   # Install dependencies
   npm install --production

   # Generate Prisma Client
   npx prisma generate
   ```
7. Go back to the cPanel **Setup Node.js App** page and click the **Restart** button.

---

## 🧪 Step 7: Verify the Deployment

1. Open your web browser and visit the URL you mapped to the app (e.g., `https://lp-backend.landmaarkdeveloper.com/`).
2. You should see the message:
   ```text
   Backend API is running in TypeScript!
   ```
3. To test the SMTP configuration, request the email test endpoint:
   `https://lp-backend.landmaarkdeveloper.com/api/test-email?email=your-personal-email@domain.com`
   You should receive a success response and an email in your inbox.

---

## 🔍 Troubleshooting

### 1. `bcrypt` fails to install or compile
On shared hosting environments, `bcrypt` compilation sometimes fails because compiler utilities (GCC/Python) are disabled in jailed shell environments.
* **Solution**: Replace `bcrypt` with `bcryptjs` (a pure JS port of bcrypt that requires zero compiling).
  In cPanel Terminal:
  ```bash
  npm uninstall bcrypt
  npm install bcryptjs
  ```
  Then, in your source code, change imports from `import bcrypt from 'bcrypt'` to `import bcrypt from 'bcryptjs'`.

### 2. Prisma Engine Binaries Error
If Prisma fails with a message that the binary engine was not found or is incompatible:
* Make sure you ran `npx prisma generate` inside the **cPanel Terminal** (virtual environment), NOT locally before zipping.
* If it still complains, add binary targets in `prisma/schema.prisma`:
  ```prisma
  generator client {
    provider      = "prisma-client-js"
    binaryTargets = ["native", "rhel-openssl-1.0.x", "rhel-openssl-1.1.x", "rhel-openssl-3.0.x"]
  }
  ```
  Then run `npx prisma generate` again on the server.

### 3. Server Errors (500 or 503 Service Unavailable)
* Go to cPanel File Manager.
* Check `/home/cpanelusername/lp-backend-landmaarkdeveloper-com/stderr.log` or the passenger logs.
* Ensure your `.env` contains the correct database user credentials.
