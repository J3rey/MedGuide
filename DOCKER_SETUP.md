# 🐳 Docker Setup Guide for MedGuide

This guide will help team members set up Docker and run the MedGuide backend locally.

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Windows 10/11** (64-bit) with WSL 2 enabled
- **Administrator access** on your computer
- **At least 4GB RAM** available for Docker

---

## 1️⃣ Install Docker Desktop

### Step 1: Download Docker Desktop

1. Go to [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Click **Download for Windows**
3. Run the installer (`Docker Desktop Installer.exe`)

### Step 2: Install Docker Deskteop

1. Double-click the installer
2. Follow the installation wizard
3. **Enable WSL 2** when prompted (recommendd)
4. Click **Finish** and restart your computer if required

### Step 3: Start Docker Desktop

1. Launch **Docker Desktop** from Start Menu
2. Wait for Docker to start (you'll see a whale icon in the system tray)
3. Accept the Docker Service Agreement if prompted

### Step 4: Verify Installation

Open PowerShell or Command Prompt and run:

```powershell
docker --version
docker-compose --version
```

You should see version numbers like:

```
Docker version 28.0.1, build 068a01e
Docker Compose version v2.33.1-desktop.1
```

---

## 2️⃣ Clone the Repository

If you haven't already cloned the project:

```powershell
# Navigate to your preferred directory
cd C:\Users\YourUsername\Documents\GitHub

# Clone the repository
git clone https://github.com/J3rey/MedGuide.git

# Enter the project directory
cd MedGuide
```

---

## 3️⃣ Setup Environment Variables

### Backend Environment File

1. Navigate to the backend folder:

   ```powershell
   cd backend
   ```

2. Copy the example environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Open `backend\.env` in your text editor (VS Code, Notepad, etc.)

4. Replace placeholder values with actual credentials:

   ```env
   # Server
   PORT=3000
   NODE_ENV=development

   # Supabase (Get these from Supabase dashboard)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-actual-anon-key-here

   # AI (Get from Google AI Studio)
   GEMINI_API_KEY=your-actual-gemini-key-here
   # OR
   OPENAI_API_KEY=your-actual-openai-key-here

   # OCR (Optional - for Google Cloud Vision)
   GOOGLE_CLOUD_VISION_KEY=your-vision-key
   ```

5. Save the file

### Where to Get API Keys:

- **Supabase**:

  1. Go to [https://supabase.com/](https://supabase.com/)
  2. Login/Create account
  3. Go to your project → Settings → API
  4. Copy `URL` and `anon public` key

- **Google Gemini API**:
  1. Go to [https://makersuite.google.com/](https://makersuite.google.com/)
  2. Click **Get API Key**
  3. Create a new API key
  4. Copy the key

---

## 4️⃣ Build and Run Docker Container

### Navigate to Project Root

Make sure you're in the main project directory (where `docker-compose.yml` is located):

```powershell
cd C:\Users\YourUsername\Documents\GitHub\MedGuide
```

### Build and Start Containers

Run this command to build and start the backend:

```powershell
docker-compose up --build -d
```

**What this does:**

- `up` - Creates and starts containers
- `--build` - Builds the Docker image
- `-d` - Runs in detached mode (background)

**Expected output:**

```
[+] Building 24.8s (12/12) FINISHED
 => [backend] exporting to image
 => => naming to docker.io/library/medguide-backend:latest

NAME                 IMAGE              COMMAND                  SERVICE   CREATED         STATUS         PORTS
medguide-backend-1   medguide-backend   "docker-entrypoint.s…"   backend   8 seconds ago   Up 7 seconds   0.0.0.0:3000->3000/tcp
```

### Verify Container is Running

```powershell
docker-compose ps
```

You should see:

```
NAME                 IMAGE              STATUS         PORTS
medguide-backend-1   medguide-backend   Up X seconds   0.0.0.0:3000->3000/tcp
```

---

## 5️⃣ Test the Backend

### Test Health Endpoint

```powershell
curl http://localhost:3000/health
```

**Expected response:**

```json
{ "status": "ok", "message": "MedGuide API is running" }
```

### Test in Browser

Open your browser and go to:

```
http://localhost:3000/health
```

---

## 6️⃣ Useful Docker Commands

### View Logs

See what's happening in the container:

```powershell
# View all logs
docker-compose logs

# View logs for backend only
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f backend
```

### Stop Containers

```powershell
# Stop containers (keeps data)
docker-compose stop

# Stop and remove containers
docker-compose down
```

### Restart Containers

```powershell
# Restart all containers
docker-compose restart

# Restart backend only
docker-compose restart backend
```

### Rebuild After Code Changes

If you make changes to the backend code:

```powershell
docker-compose down
docker-compose up --build -d
```

### Check Container Status

```powershell
# Using docker-compose
docker-compose ps

# Using docker
docker ps
```

### Access Container Shell

If you need to debug inside the container:

```powershell
docker exec -it medguide-backend-1 sh
```

To exit the container shell, type:

```
exit
```

---

## 🐛 Troubleshooting

### Issue: "Docker daemon is not running"

**Solution:**

1. Make sure Docker Desktop is running
2. Look for the whale icon in your system tray
3. If not running, open Docker Desktop from Start Menu
4. Wait 30-60 seconds for it to start

### Issue: "Port 3000 is already in use"

**Solution:**

```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the actual number)
taskkill /PID <PID> /F

# Or change the port in docker-compose.yml
```

### Issue: "Cannot connect to Docker daemon"

**Solution:**

1. Restart Docker Desktop
2. In Docker Desktop settings, ensure WSL 2 integration is enabled
3. Restart your computer if needed

### Issue: Environment variables not working

**Solution:**

1. Make sure `backend\.env` file exists (not `.env.example`)
2. Check that there are no spaces around the `=` sign
3. Restart containers after changing `.env`:
   ```powershell
   docker-compose down
   docker-compose up -d
   ```

### Issue: Build fails with "no space left on device"

**Solution:**

1. Clean up old Docker images:
   ```powershell
   docker system prune -a
   ```
2. In Docker Desktop settings, increase disk space allocation

### Issue: Changes to code not reflected

**Solution:**
The Docker container uses volumes to sync your code, but sometimes you need to rebuild:

```powershell
docker-compose down
docker-compose up --build -d
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/install/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MedGuide Main README](./README.md)

---

## 💡 Tips for Team Members

1. **Always pull latest code before starting:**

   ```powershell
   git pull origin main
   docker-compose up --build -d
   ```

2. **Check logs if something isn't working:**

   ```powershell
   docker-compose logs -f backend
   ```

3. **Stop containers when not working** to save system resources:

   ```powershell
   docker-compose stop
   ```

4. **Keep Docker Desktop updated** for best performance

5. **Share environment variables securely** - Never commit `.env` files to Git!

---

## 🚀 Quick Start Checklist

- [ ] Install Docker Desktop
- [ ] Verify Docker installation (`docker --version`)
- [ ] Clone MedGuide repository
- [ ] Create `backend\.env` from `backend\.env.example`
- [ ] Add API keys to `.env` file
- [ ] Run `docker-compose up --build -d`
- [ ] Test at `http://localhost:3000/health`
- [ ] View logs with `docker-compose logs -f backend`

---

## 🤝 Need Help?

If you encounter issues:

1. Check the [Troubleshooting](#-troubleshooting) section above
2. Ask in the team Slack/Discord channel
3. Create an issue in the GitHub repository
4. Contact Jerey or Alvin

---

**Happy Coding! 🎉**
