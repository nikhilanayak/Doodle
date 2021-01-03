# Doodle
Doodle is a clone of skribbl.io, written in JavaSript, NodeJS using React, P5.js and socket.io.

## Installation
1. Clone This Repository
    ```bash
    git clone https://github.com/nikhilAnayak/Doodle.git
    ```
2. Install NPM Packages
    ```bash
    cd public
    npm install
    cd ..
    ```
    ```bash
    cd src
    npm install
    cd ..
    ```

## Running Locally
The static frontend files are served using the same program as the backend, so only one command is required to run.
```bash
cd src
node index.js
```

## Making Changes
If you want to make changes to the backend, just change the src/index.js file. However, to alter the frontend, you will need to rebuild with snowpack like so.
```bash
cd public
npm run build # alternatively, run: snowpack build
cd ..
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

