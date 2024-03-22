import DialogoModel from "../DialogoModel.js";
import VerbGameView from "../Views/VerbGameView.js";
import LanguageManager, { Languages } from "../LanguageManager.js";
import IndexController from "../Controllers/IndexController.js";
import AssociateVerbsGameController from "./AssociateVerbsGameController.js";
import {compress, decompress} from "compress-json";

/**
 * Controller for the Verb game view.
 */
export default class VerbGameController {
    #Model;
    #View;
    #appLanguage = "";
    #currentLanguage = "";
    #currentVerb;

    /**Constructs a new instance of the VerbGameController.
     * @param {string} [learningLanguage=""] What verb is the user learning?
     */
    constructor(learningLanguage = "") {
        this.#Model = new DialogoModel(DialogoModel.MAIN_CACHE_NAME);
        this.#appLanguage = Languages.getLanguageName(parseInt(localStorage.getItem("currentLanguage"))).toLowerCase();
        this.#currentLanguage = learningLanguage.toLowerCase();

        this.#Model.fetchData(VERBS_URL, false).then(verbs => {
            let verb = verbs[this.getRandomArbitrary(0, verbs.length)];
            this.#currentVerb = decompress(verb[this.#currentLanguage]);
            let currentBCP47 = Languages.BCP47FromLangName(this.#currentLanguage);
            this.#View = new VerbGameView(DialogoModel.VERBSGAMEVIEW_ID.replace("View", "Template"),
            decompress(verb[this.#currentLanguage]), decompress(verb[this.#appLanguage]), currentBCP47);
            this.#View.onNavigatingToAssociateVerbsGame(() => this.#navigateToAssociateVerbsGame());
            this.#View.onNavigatingToIndex(() => this.navigateToIndex());
        }).catch(error => console.error("Error loading verbs: ", error));

        /**Event handler for navigating to the index. */
        async function navigateToIndex() {
            await IndexController.createIndexController();
        }
    }

    /**Event handler for navigating to the associate verbs game.*/
    async #navigateToAssociateVerbsGame() {
        let associateVerbsGameCtrl = new AssociateVerbsGameController(this.#currentLanguage, 
            this.#currentVerb);
    }

    /**Gets a random integer between min (inclusive) and max (exclusive).
     * Ensures the returned value is a valid array index.
     * @param {number} min The minimum value of the random number.
     * @param {number} max The maximum value of the random number.
     * @returns A random integer equal to or greater than min, and strictly less than max.*/
    getRandomArbitrary(min = 0, max = 1) {
        return Math.floor(Math.random() * (max - min) + min);
    }
}

const VERBS_URL = "./verbs/";