# Academic Portal — Notice Board & Calendar

A full-stack MERN application for managing college notices and academic calendar events.

## Project Structure

```
academicPortal/
├── backend/
│   ├── models/
│   │   ├── Notice.js
│   │   └── Event.js
│   ├── routes/
│   │   ├── notices.js
│   │   └── events.js
│   ├── .env
│   ├── package.json
│   ├── seedData.js
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Notices.js
    │   │   └── Calendar.js
    │   ├── App.js
    │   ├── index.js
    │   └── styles.css
    └── package.json
```

## Prerequisites

- **Node.js** (v16 or higher) — https://nodejs.org
- **MongoDB** (running locally) — https://www.mongodb.com/try/download/community

## How to Run

### Step 1 — Start MongoDB

Make sure MongoDB is running on your machine:

```bash
# On macOS (Homebrew)
brew services start mongodb-community

# On Ubuntu/Linux
sudo systemctl start mongod

# On Windows — run MongoDB Compass or mongod.exe
```

### Step 2 — Set up the Backend

```bash
cd backend
npm install
```

(Optional) Seed the database with sample data:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev       # with hot-reload (nodemon)
# or
npm start         # plain node
```

Backend runs at: **http://localhost:5000**

### Step 3 — Set up the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

## API Endpoints

### Notices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notices | Get all notices (filter: ?category=Exam) |
| GET | /api/notices/:id | Get single notice |
| POST | /api/notices | Create new notice |
| PUT | /api/notices/:id | Update notice |
| DELETE | /api/notices/:id | Delete notice |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/events | Get all events (filter: ?month=5&year=2025) |
| GET | /api/events/:id | Get single event |
| POST | /api/events | Create new event |
| PUT | /api/events/:id | Update event |
| DELETE | /api/events/:id | Delete event |

## Environment Variables

Edit `backend/.env` with your MongoDB Atlas connection string and a secure JWT secret.

For a local MongoDB server:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/academicPortal
JWT_SECRET=some_long_secret
```

For MongoDB Atlas, use the connection string from Atlas:

```bash
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/academicPortal?retryWrites=true&w=majority
JWT_SECRET=some_long_secret
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=ChangeMe123!
DEFAULT_ADMIN_NAME=Academic Portal Admin
PORT=5000
```

> Important: do not commit your real Atlas password, JWT secret, or admin credentials to source control.

When the backend starts, it will automatically create a default admin user if one does not already exist. That admin account cannot be created through the user registration flow.

### Connecting in MongoDB Compass

To see the database in MongoDB Compass, connect using the same Atlas URI and choose the `academicPortal` database.

- Open MongoDB Compass.
- Click **New Connection**.
- Paste the Atlas `MONGO_URI` from `backend/.env`.
- Click **Connect**.
- Expand the `academicPortal` database.
- Open the `users` collection to view signup records.

If the database is empty, sign up once in the app and then refresh Compass. The `users` collection will appear after the first registered user.

### Verify Atlas connection with a script

You can also verify the Atlas connection from the backend directory:

```bash
cd backend
npm run atlas-check
```

That script will:

- verify `MONGO_URI` and `JWT_SECRET` are set
- connect to Atlas
- print the current collections
- print the database name and object count
- disconnect cleanly

### Fallback for SRV lookup issues

If your system cannot resolve the `mongodb+srv://` record, add a standard URI fallback to `backend/.env`:

```env
MONGO_URI_FALLBACK=mongodb://<username>:<password>@<host1>:27017,<host2>:27017,<host3>:27017/academicPortal?authSource=admin&replicaSet=<replicaSetName>&tls=true&retryWrites=true&w=majority
```

This project now supports `MONGO_URI_FALLBACK` so the backend will automatically try the fallback if SRV lookup fails.

### Deploying to Render

For Render deployment, do not rely on `backend/.env` inside source control. Instead set the same variables in the Render dashboard.

1. Open your Render service.
2. Go to `Environment` or `Environment Variables`.
3. Add these keys:
   - `PORT` → `5000`
   - `MONGO_URI` → your Atlas connection string
   - `MONGO_URI_FALLBACK` → optional fallback connection string
   - `JWT_SECRET` → a secure random string

Render injects those values at runtime, so the backend will read them automatically.

If Render still cannot connect to MongoDB Atlas, the issue is usually Atlas network access.

### MongoDB Atlas whitelist for Render

Atlas must allow Render's outbound IP address. If you do not have a static Render IP range, use this approach during testing:

- In Atlas, go to **Network Access** → **IP Access List**.
- Add `0.0.0.0/0` temporarily to allow all IPs.
- Save and retry the Render deployment.

After deployment works, tighten the whitelist if you can to a smaller CIDR range.

### Atlas whitelist and Compass access

If connection still fails, make sure your Atlas cluster allows your IP address:

- In Atlas, go to **Network Access** → **IP Access List**.
- Add your current IP or `0.0.0.0/0` for development.- If you need this exact address, add `157.40.106.200` to the list as well.- Save and retry the connection.

Then open MongoDB Compass using the same `MONGO_URI` value from `backend/.env` to inspect the `academicPortal` database.
