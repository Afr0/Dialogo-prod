import express from "express";
import { HttpCodes } from "../modules/httpConstants.mjs";
import Translate from "../middleware/Translate.mjs";

const TRANSLATION_API = express.Router();

TRANSLATION_API.post("/", express.json(), Translate.translateFrom, (req, res) => {
    //TODO: Propagate translations into DB...
});

/**A very simple middleware for handling errors
 * that sends a generic error message to the client.
 */
TRANSLATION_API.use((err, req, res, next) => {
    console.error(err);
    res.status(HttpCodes.ClientSideErrorResponse).send('An error occurred.');
    next();
})

export default TRANSLATION_API;