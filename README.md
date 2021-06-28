# CloudNein

## Installation

### Step 1:
#### Option 1:
```console
foo@bar:CloudNein/server$ npm install
```
```console
foo@bar:CloudNein/client$ npm install
```
```console
foo@bar:CloudNein/client$ npm run build
```
#### Option 2:

Run default VSCode Build task: 'npm install client + server'

( Shortcut: CTRL+SHIFT+B )

### Step 2:
```console
foo@bar:CloudNein/client$ npm run build
```
## Run
### Starting the client (React server):

#### Step 1 (Optional - only required if 'serve' is not installed):
```console
foo@bar:CloudNein/client$ npm install -g serve
```
#### Step 2:
```console
foo@bar:CloudNein/client$ serve -s build
```

### Starting the server (NodeJS Express):
```console
foo@bar:CloudNein/server$ node app.js
```

### Important users:
Create a user with the name "Admin" the password and email is up to you.
Create a second user with your desired information and an email address to which you have access.
