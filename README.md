# COSC540-Flashcard Builder
Requirments
* Install Node JS (link) https://nodejs.org/en/download

How to download and run
* Switch to development branch
* clone development branck
* Open file in editor
* CD into COSC540-Flashcard-Builder if not already there
* From the terminal type "npm i" without the quotes.  This will take a few minutes.
* Then, in the terminal type "npm run dev" without quotes.
* navigate to http://localhost:3000
* Now the project is running

File Structure
* App - contains the main (home) page and layout
* Components - will hold all of the parts that we will use within the app. Reusable components is the goal.
* Pages - a page is made up of multiple components. The file name is the routing extension for that page Example, dash.jsx (Dashboard page) will be http://localhost:3000/dash\
* Images - holds all of the logos and images
* Styles - is for CSS sheets.  We have a global style sheet in the app folder.  The Styles folder gives us the ability to add CSS and not worry about messing something up within the global CSS sheet
* Utils - can be used for any json files and context files
* .env - you will need to make this file since we block it from being uploaded.  This file holds any secret keys or passwords we may use.

Package.json
* This holds the list of dependencies that we use
  * Example Axios and express deals with server calls. bcrypt is used for hashing passwords
* Be careful when updating dependencies, it can break the app.
