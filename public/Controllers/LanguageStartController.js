import DialogoModel from "../DialogoModel.js";
import LanguageStartView from "../Views/LanguageStartView.js";
import LanguageManager from "../LanguageManager.js";
import IndexController from "../Controllers/IndexController.js";
import AlphabetGameController from "./AlphabetGameController.js";
import LanguagePortalController from "../Controllers/LanguagePortalController.js";

/**
 * Controller for the Login view.
 */
export default class LanguageStartController {
    #Model;
    #View;
    #LangManager = new LanguageManager();

    constructor() {
        this.#Model = new DialogoModel(DialogoModel.USER_CACHE_NAME);

        let knownAlphabets = sessionStorage.getItem(DialogoModel.KNOWNALPHABETS_CACHE_NAME);
        if(!knownAlphabets)
            knownAlphabets = "{}";

        this.#View = new LanguageStartView(DialogoModel.LANGUAGESTARTVIEW_ID.replace("View", "Template"),
                                           JSON.parse(knownAlphabets));

        /**Event handler for navigating to the index. */
        async function navigateToIndex() {
            await IndexController.createIndexController();
        }

        /**Event handler for navigating to the Italian alphabet game. */
        function navigateToItalianAlphabetGame(language = "") {
            let alphabetGameController = new AlphabetGameController(language);
        }

        /**Event handler for navigating to the Russian alphabet game. */
        function navigateToRussianAlphabetGame(language = "") {
            let alphabetGameController = new AlphabetGameController(language);
        }

        /**Event handler for navigating to the English alphabet game. */
        function navigateToEnglishAlphabetGame(language = "") {
            let alphabetGameController = new AlphabetGameController(language);
        }

        /**Event handler for navigating to the English language portal. */
        function navigateToEnglishLanguagePortal(language = "") {
            let languagePortalController = new LanguagePortalController(language);
        }

        /**Event handler for navigating to the Italian language portal. */
        function navigateToItalianLanguagePortal(language = "") {
            let languagePortalController = new LanguagePortalController(language);
        }

        /**Event handler for navigating to the Russian language portal. */
        function navigateToRussianLanguagePortal(language = "") {
            let languagePortalController = new LanguagePortalController(language);
        }

        this.#View.onNavigatingToIndex(() => navigateToIndex());
        this.#View.onNavigatingToItalianAlphabetGame(() => navigateToItalianAlphabetGame(DialogoModel.LEARNING_ITALIAN));
        this.#View.onNavigatingToRussianAlphabetGame(() => navigateToRussianAlphabetGame(DialogoModel.LEARNING_RUSSIAN));
        this.#View.onNavigatingToEnglishAlphabetGame(() => navigateToEnglishAlphabetGame(DialogoModel.LEARNING_ENGLISH));
        this.#View.onNavigatingToItalianLanguagePortal(() => navigateToItalianLanguagePortal(DialogoModel.LEARNING_ITALIAN));
        this.#View.onNavigatingToRussianLanguagePortal(() => navigateToRussianLanguagePortal(DialogoModel.LEARNING_RUSSIAN));
        this.#View.onNavigatingToEnglishLanguagePortal(() => navigateToEnglishLanguagePortal(DialogoModel.LEARNING_ENGLISH));
    }
}