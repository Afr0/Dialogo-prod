import express from "express";
import { HttpCodes } from "../modules/httpConstants.mjs";
import Verb from  "../modules/Verb.mjs";

const VERB_API = express.Router();

VERB_API.get("/", express.json(), async (req, res) => {
    let verbsData = await Verb.getVerbs();
    if (!verbsData)
        return res.status(HttpCodes.ClientSideErrorResponse.NotFound).json({error: "No verbs found."});
    
    //TODO: Future improvement - compress these for when
    //there are hundreds of verbs.
    let verbs = Object.values(verbsData).map(verb => ({
        name: verb.getName(),
        english: JSON.parse(verb.getEnglishVerb()),
        italian: JSON.parse(verb.getItalianVerb()),
        russian: JSON.parse(verb.getRussianVerb()),
    }));
    
    res.status(HttpCodes.SuccessfulResponse.Ok).json(verbs);
});

/**A very simple middleware for handling errors
 * that sends a generic error message to the client.
 */
VERB_API.use((err, req, res, next) => {
    console.error(err);
    res.status(HttpCodes.ClientSideErrorResponse).send('An error occurred.');
    next();
})

export default VERB_API;