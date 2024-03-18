import 'dotenv/config';
import express from 'express'; // Express is installed using npm
import USER_API from './routes/usersRoute.mjs'; // This is where we have defined the API for working with users.
import Translate from "./middleware/Translate.mjs";
import TRANSLATION_API from './routes/translationsRoute.mjs';
import VERB_API from './routes/verbsRoute.mjs';
import SuperLogger from "./modules/SuperLogger.mjs";

// Creating an instance of the server
const server = express();
// Selecting a port for the server to use.
const port = (process.env.PORT || 8080);
server.set('port', port);

server.get('/manifest.json', (req, res) => {
    res.type('application/manifest+json');
    res.sendFile('public/manifest.json');
});

//Avoid buffer overflows.
server.use(express.json({ limit: '500kb' }));

server.use(express.urlencoded({
  extended: true,
  limit: '500kb'
}));

//Defining a folder that will contain static files.
server.use(express.static('public'));

//Translate.initialize("./middleware/API_KEY.txt");

// Telling the server to use the USER_API (all urls that uses this code will have to have the /user after the base address)
server.use("/user", USER_API);

server.use("/translations", TRANSLATION_API);

server.use("/verbs", VERB_API);

// Enable logging for server
/*const logger = new SuperLogger();
server.use(logger.createAutoHTTPRequestLogger());*/ // Will log all http method requests

// A get request handler example
server.get("/", (req, res) => {
    res.sendFile('public/index.html');
});

// Start the server 
server.listen(server.get('port'), function () {
    console.log('server running', server.get('port'));
});
