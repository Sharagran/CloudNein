# CloudNein

## Installation
### Option 1:
```console
foo@bar:CloudNein/server$ npm install
```
```console
foo@bar:CloudNein/client$ npm install
```
```console
foo@bar:CloudNein/client$ npm run build
```
### Option 2:

Run default VSCode Build task: 'npm install client + server'

Shortcut: CTRL+SHIFT+B
```console
foo@bar:CloudNein/client$ npm run build
```
## Run
### Starting the client (React server):

Step 1 (Optional - only required if 'serve' is not installed):
```console
foo@bar:CloudNein/client$ npm install -g serve
```
Step 2:
```console
foo@bar:CloudNein/client$ serve -s build
```

### Starting the server (NodeJS Express):
```console
foo@bar:CloudNein/server$ npm start
```
