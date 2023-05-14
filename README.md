
# Spice Scape Server

This Project acts as the backend server to Spice Scape, a recipe sharing web application that allows for the registration and logging in of users who have the ability to create, edit, or delete recipes, comments, as well as their own profiles.


## Features

- Light/dark mode toggle (client-side)
- Image Uploading
- Following Feed 

## Available Scripts

Install node modules with npm

```bash
  cd spice-scape-server
  npm install
```

Run spice-scape-server locally on port 3000

```bash
  cd spice-scape-server
  npm start
```
    
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGO_URI`

`CLOUDINARY_CLOUD_NAME`

`CLOUDINARY_API_KEY`

`CLOUDINARY_API_SECRET`

`TOKEN_SECRET`

`EXPIRES_IN`

## Built With

- Node (javascript runtime)
- Express (backend framework)
- Mongoose (database ORM)
- Joi (input validation)
- Cloudinary (image uploading/handling)
