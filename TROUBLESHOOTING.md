# Troubleshooting Guide for Dhan Sathi App

If you're experiencing issues with the login or registration, follow these steps to diagnose and fix the problem:

## 1. Make Sure MySQL Server is Running

Check if MySQL server is running on your computer:

```
# In Windows PowerShell, check MySQL status
Get-Service -Name MySQL*
```

If it's not running, start it:

```
# Start MySQL service
Start-Service -Name MySQL*
```

## 2. Test Database Connection

Run the database test script to check connectivity:

```
cd server
node dbtest.js
```

If there are connection errors, verify:
- MySQL is running
- Username and password in `.env` are correct
- Database name is correct

## 3. Start the Backend Server

Start the Express backend server:

```
cd server
npm install
npm run dev
```

Keep this terminal open and look for any error messages.

## 4. Test API Health

Open a web browser and go to:
```
http://localhost:5000/api/health
```

You should see a response with `{"status":"ok","message":"Server is running"}`.

## 5. Start the Frontend

In a new terminal window:

```
cd ..
npm install
npm run dev
```

## 6. Clear Browser Cache

If you're still having issues:
- Open browser DevTools (F12)
- Go to Network tab
- Check "Disable cache"
- Try refreshing the page

## Common Issues and Solutions

1. **"Registration failed" Error**
   - Check if MySQL server is running
   - Verify database credentials in `server/.env`
   - Check browser console for specific error messages

2. **Connection Refused**
   - Make sure the backend server is running
   - Check if the port (5000) is available or change it in `.env`

3. **Database Errors**
   - Run `node dbtest.js` to diagnose database issues
   - Check the server terminal for specific error messages

4. **CORS Errors**
   - The server is configured to allow all origins in development
   - If you see CORS errors, restart both frontend and backend