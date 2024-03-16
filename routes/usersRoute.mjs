import express from "express";
import User from "../modules/user.mjs";
import { HttpCodes } from "../modules/httpConstants.mjs";
import preferredLanguage from "../middleware/preferredLanguage.mjs";
import SuperLogger from "../modules/SuperLogger.mjs";
import SRPServer from "secure-remote-password/server.js";
import crypto from "node:crypto";

const USER_API = express.Router();

var users = [];

var sessionDetails = {};

/**Server's secret ephemerals. 
 * Stored in-memory, as their 
 * lifetime are on a
 * session by session basis.
 */
var serverSecrets = {};

/**Clients' public ephemerals. 
 * Stored in-memory, as their 
 * lifetime are on a
 * session by session basis.
 */
var clientEphemerals = {};

/**
 * @returns An existing user based on the ID.
 */
USER_API.get('/:id', (req, res) => {
    let { id } = req.params;

    let user = users.find(user => user && user.getId() === id);

    if (user)
        res.status(HttpCodes.SuccessfulResponse.Ok).json(user);
    else
        res.status(HttpCodes.ClientSideErrorResponse.NotFound).send('User not found!');
});

USER_API.post('/', express.json(), preferredLanguage, async (req, res) => {
    // This is using javascript object destructuring.
    // Recommend reading up https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#syntax
    // https://www.freecodecamp.org/news/javascript-object-destructuring-spread-operator-rest-parameter/
    let { userName, verifier, salt } = req.body;

    //u0400-u04FF = Cyrillic alphabet.
    if (!/^[a-æøåA-ÆØÅ0-9\s\u0400-\u04FF]+$/i.test(userName))
        res.status(HttpCodes.ClientSideErrorResponse.BadRequest).end(); //F*ck off!

    if (userName != "" && verifier != "" && salt != "") {
        let user = users.find(user => user && user.getUsername() === userName);
        if(!user) {
            await User.getUser(userName).then(async (user) => {
                if (!user) {
                    let newUser = new User(userName, verifier, salt);
                    newUser = await newUser.save();
                    users.push(newUser);
                    res.status(HttpCodes.SuccessfulResponse.Ok).json(JSON.stringify(user));
                } else {
                    res.status(HttpCodes.ClientSideErrorResponse.BadRequest).send("User already existed.").end();
                }
            });
        } else {
            res.status(HttpCodes.ClientSideErrorResponse.BadRequest).send("User already existed.").end();
        }
    } else {
        res.status(HttpCodes.ClientSideErrorResponse.BadRequest).send("Missing data field.").end();
    }
});

USER_API.post('/login', express.json(), async (req, res) => {
    let { userName, ephemeral } = req.body;

    //u0400-u04FF = Cyrillic alphabet.
    if (!/^[a-æøåA-ÆØÅ0-9\s\u0400-\u04FF]+$/i.test(userName))
        res.status(HttpCodes.ClientSideErrorResponse.BadRequest).end(); //F*ck off!

    let user = users.find(user => user && user.getUsername() === userName);

    try {
        if(!user) {
            console.log("Trying to get user from DB...");
            user = await User.getUser(userName);

            if(user)
                users.push(user); //Cache user to avoid DB hits.
            else {
                res.status(HttpCodes.ClientSideErrorResponse.BadRequest).send("User didn't exist.").end();
                return;
            }
        }

        clientEphemerals[userName] = ephemeral;

        let serverEphemeral = SRPServer.generateEphemeral(user.getVerifier());
        //These don't have to go in the DB as their lifetime are on a session by session basis.
        serverSecrets[user.getUsername()] = serverEphemeral.secret;
        res.status(HttpCodes.SuccessfulResponse.Ok).json(JSON.stringify(
            {salt: user.getSalt(), ephemeral: serverEphemeral.public}));
    } catch(error) {
        console.log(error);
        res.status(HttpCodes.ClientSideErrorResponse.BadRequest).send("Error during login.").end();
    }
});

USER_API.post('/proof', express.json(), async (req, res) => {
    let { userName, proof } = req.body;

    //u0400-u04FF = Cyrillic alphabet.
    if (!/^[a-æøåA-ÆØÅ0-9\s\u0400-\u04FF]+$/i.test(userName))
        res.status(HttpCodes.ClientSideErrorResponse.BadRequest).end(); //Fuck off!

    let serverSecretEphemeral = serverSecrets[userName];

    let user = users.find(user => user && user.getUsername() === userName);
    if(!user) {
        console.log("Trying to get user from DB...");
        user = await User.getUser(userName);
    }

    try {
        let serverSession = SRPServer.deriveSession(serverSecretEphemeral, 
            clientEphemerals[userName], user.getSalt(), userName, user.getVerifier(), proof);

        if(serverSession.proof) {
            let sessionID = crypto.randomUUID();
            sessionDetails[sessionID] = {
                salt: user.getSalt(),
                encryptionKey: serverSession.key,
                userName: userName 
            };

            res.status(HttpCodes.SuccessfulResponse.Ok).json(JSON.stringify(
                { sessionID: sessionID, proof: serverSession.proof, 
                preferredLanguage: user.getPreferredLanguage(), 
                knownAlphabets: user.getAlphabetsKnown() }));
        }
        else
            res.status(HttpCodes.ClientSideErrorResponse.NotAcceptable).json(JSON.stringify({}));
    } catch(error) {
        console.log(error);
        res.status(HttpCodes.ClientSideErrorResponse.NotAcceptable).json(JSON.stringify({}));
    }
});

USER_API.post('/logout', express.json(), async (req, res) => {
    let { userName, sessionID } = req.body;

    //u0400-u04FF = Cyrillic alphabet.
    if (!/^[a-æøåA-ÆØÅ0-9\s\u0400-\u04FF]+$/i.test(userName))
        res.status(HttpCodes.ClientSideErrorResponse.BadRequest).end(); //Fuck off!

    let encryptionKey;

    for (const [sessionID, details] of Object.entries(sessionDetails)) {
        if(details.userName === userName) {
            encryptionKey = details.encryptionKey;
            break;
        }
    }

    if(encryptionKey === "")
        res.status(HttpCodes.ClientSideErrorResponse.NotAcceptable).json(JSON.stringify({ message: "Invalid sessionID!" }));

    try {
        if(sessionDetails[sessionID] !== null) {
            console.log("Successful logout!");
            res.status(HttpCodes.SuccessfulResponse.Ok).json({ message: "User logged out." });

            delete sessionDetails[sessionID];
            delete serverSecrets[userName];
            delete clientEphemerals[userName];
        }
    } catch(error) {
        console.log(error);
        res.status(HttpCodes.ClientSideErrorResponse.NotAcceptable).json(JSON.stringify({}));
    }
});

USER_API.put('/', express.json(), async (req, res) => {
    let { sessionID, userName, preferredLanguage, knownAlphabets } = req.body;

    //u0400-u04FF = Cyrillic alphabet.
    if (!/^[a-æøåA-ÆØÅ0-9\s\u0400-\u04FF]+$/i.test(userName))
        res.status(HttpCodes.ClientSideErrorResponse.BadRequest).end(); //Fuck off!

    let session = sessionDetails[sessionID];

    if(session) {
        console.log("Found session, updating user...");
        let user = users.find(user => user && user.getUsername() === userName);
        user.setPreferredLanguage(preferredLanguage);
        console.log("Alphabets known: " + knownAlphabets);
        if(knownAlphabets)
            user.setAlphabetsKnown(knownAlphabets);
        await user.save();

        res.status(HttpCodes.SuccessfulResponse.Ok).json({ message: "User updated successfully." });
    } 
    else
        res.status(HttpCodes.ClientSideErrorResponse.NotFound).json({ message: "User not found." });
});

USER_API.delete('/:id', (req, res) => {
    /// TODO: Delete user.
    const user = new User(); //TODO: Actual user
    user.delete();
});

/**A very simple middleware for handling errors
 * that sends a generic error message to the client.
 */
USER_API.use((err, req, res, next) => {
    console.error(err);
    res.status(HttpCodes.ClientSideErrorResponse).send('An error occurred.');
    next();
});

export default USER_API
