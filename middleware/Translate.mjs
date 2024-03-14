import { promises as fs } from 'node:fs';
import Languages from "../Languages.mjs";
import fetch from 'node-fetch';
import SuperLogger from '../modules/SuperLogger.mjs';

/**A middleware that translates any number of English sentences into
 * any language(s) that are implemented by an application. A client
 * can use this middleware by sending a JSON-encoded POST with any
 * number of English sentences in a sentences array of the body.
 */
export default class Translate {
    static #apiKey;
    static #url = 'https://translation.googleapis.com/language/translate/v2';
    static #initialized = false;

    /**Initializes this Translate class by loading a Google Translate
     * API key from a specified file.
     * @param {string} [pathToApiKey="API_KEY.txt"] Path to the API key file. Defaults to API_KEY.txt.
     */
    static async initialize(pathToApiKey = "API_KEY.txt") {
        try {
            let data = await fs.readFile(pathToApiKey, "ascii");
            this.#apiKey = data.trim(); //Trim to remove any newline character.
            this.#initialized = true;
        } catch (error) {
            SuperLogger.log("Failed to initialize Translate class:", SuperLogger.LOGGING_LEVELS.CRTICAL);
            throw error;
        }
    }

    /**Gets a valid language code from a given implemented language.
     * Based on: https://www.andiamo.co.uk/resources/iso-language-codes/
     */
    static #getValidLanguageCode(language = "") {
        switch(language) {
            case "Italian":
                return "it";
            case "Russian":
                return "ru";
            default:
                return "en";
        }
    }

    /**Translates a number of sentences from a request
     * into however many languages are implemented in an
     * application.
     */
    static async translateFrom(req, res, next) {
        if (!Translate.#initialized) {
            SuperLogger.log("Translate class not initialized.", SuperLogger.LOGGING_LEVELS.CRTICAL);
            return next(new Error("Translation service not initialized."));
        }
        
        let sentences = req.body.sentences || ["Default"];
        let translatedSentences = [];

        try {
            for(let sentence of sentences) {
                translatedSentences = [];
                //Creates an async function for each object...
                let translationPromises = Object.values(Languages.ImplementedLanguages).map(async (langKey) => {
                    let targetLanguage = Languages.getLanguageName(langKey);

                    //All sentences from the client are assumed to be in English.
                    if(targetLanguage !== "English") {
                        let requestBody = {
                            q: sentence,
                            target: Translate.#getValidLanguageCode(targetLanguage),
                            format: 'text'
                        };

                        let response = await fetch(Translate.#url + "?key=" + Translate.#apiKey, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(requestBody),
                        });

                        return response.json();
                    }
                });

                let sentenceTranslations = await Promise.all(translationPromises);
                translatedSentences.push({sentence, translations: sentenceTranslations});
            }
        } catch(error) {
            SuperLogger.log("Translate: " + error + " error in translation.", 
                SuperLogger.LOGGING_LEVELS.CRTICAL);
            return next(new Error("Translate: " + error + " error in translation."));
        }

        res.json({translations: translatedSentences});
        next();
    }
}