# Backend with Node, Express & Mongodb

### Run
`npm start`

### Run in production mode with less error messages
`npm production`

<br><br>
<br><br>

# Routes
### Checkout the API.md files in /routes for a more detailed explanation of how to use the API for specific routes. 


<br><br>
<br><br>

## Backend structure
### The general structure of the backend looks as follows:

#### app.js
Imports the routes form /routes and applies them.

#### /routes
The related routes are grouped into folders; each folder has an index.js that simply applies the route. The folder also contains a /handlers folder which contains one file each for every route, this is where the majority of the route handling takes place.
Each handler in turn makes use of an imported function from /models. 

#### /models
Each file in models exports an object with methods for interacting with the database.

#### /mongodb
Primarily contains database.js, which automatically runs at the startup of the server. 
This file performs the initial setup of the collections and connects to the database.
