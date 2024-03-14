import DialogoModel from "../DialogoModel.js";
import LanguagePortalView from "../Views/LanguagePortalView.js";
import AlphabetGameController from "./AlphabetGameController.js";
import IndexController from "../Controllers/IndexController.js";
import LanguageManager from "../LanguageManager.js";
import { Languages } from "../LanguageManager.js";
import VerbGameController from "./VerbGameController.js";

/**
 * Controller for the Language Portal view.
 * A controller acts as a bridge between the Model and the View in the MVC pattern.
 * Using a Controller ensures that a Model is never aware of the View and vice
 * versa, ensuring separation of concerns.
 */
export default class LanguagePortalController {
    #Model;
    #View;
    #currentLanguage;

    /**
     * Constructs an instance of LanguagePortalController.
     * @param {string} [learningLanguage=""] Which language is the user currently learning?
     */
    constructor(learningLanguage = "") {
        this.#Model = new DialogoModel(DialogoModel.USER_CACHE_NAME);
        this.#View = new LanguagePortalView(DialogoModel.LANGUAGEPORTALVIEW_ID.replace("View", "Template"));
        this.#View.onNavigatingToIndex(() => this.#navigateToIndex());
        this.#View.onNavigatingToAlphabet(() => this.#navigateToAlphabet());
        this.#View.onNavigatingToVerbs(() => this.#navigateToVerbs());
        this.#currentLanguage = learningLanguage.toLowerCase();
    }

    /**Event handler for navigating to the index. */
    async #navigateToIndex() {
        await IndexController.createIndexController();
    }

    #navigateToAlphabet() {
        let alphabetController = new AlphabetGameController(this.#currentLanguage);
    }

    #navigateToVerbs() {
        let alphabetController = new VerbGameController(this.#currentLanguage);
    }
}