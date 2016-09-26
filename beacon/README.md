# Beacon API demo
This is a demo of the [Beacon API](http://www.w3.org/TR/beacon/) using a basic
Node.js server. Upon pageload, a script (beacon_demo.js) attempts to send some
sample beacon data to the server.

The example data here is simply the timestamp of the send. The server will then
receive the data and log the timestamp of reception and print it to the page.

## Setup instructions
1. If you don't already have it, install [Node.js](https://nodejs.org/)
2. Download the code from this "beacon" folder locally.
3. Open a console window and navigate to your beacon directory
4. Install dependencies: `npm install`
5. Start the server
 - on Windows: `set DEBUG=beacon;* & npm start`
 - on MacOS / Linux: `DEBUG=beacon ./bin/www`
6. Navigate your browser to http://localhost:3000
