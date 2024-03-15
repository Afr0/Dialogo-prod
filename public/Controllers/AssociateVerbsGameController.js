import DialogoModel from "../DialogoModel.js";
import AssociateVerbsGameView from "../Views/AssociateVerbsGameView.js";
import LanguageManager, { Languages } from "../LanguageManager.js";
import IndexController from "./IndexController.js";
import LanguagePortalController from "./LanguagePortalController.js";

/**
 * Controller for the Login view.
 */
export default class AssociateVerbsGameController {
    #Model;
    #View;
    #appLanguage = "";
    #currentLanguage = "";

    /**Constructs a new instance of the AlphabetGameController.
     * @param {string} [learningLanguage=""] What alphabet is the user learning?
     */
    constructor(learningLanguage = "", verb) {
        this.#Model = new DialogoModel(DialogoModel.MAIN_CACHE_NAME);
        this.#appLanguage = Languages.getLanguageName(parseInt(localStorage.getItem("currentLanguage"))).toLowerCase();
        this.#currentLanguage = learningLanguage.toLowerCase();
        let currentBCP47 = Languages.BCP47FromLangName(this.#currentLanguage);
        this.#View = new AssociateVerbsGameView(DialogoModel.ASSOCIATEVERBSGAMEVIEW_ID.replace("View", "Template"), 
                                                verb, currentBCP47);
        this.#View.onNavigatingToIndex(() => navigateToIndex());
        this.#View.onNavigatingToLanguagePortal(() => this.#navigateToLanguagePortal());

        /**Event handler for navigating to the index. */
        async function navigateToIndex() {
            await IndexController.createIndexController();
        }
    }

    /**Event handler for navigating to the Language Portal.
     * This will congratulate the user, 
     * send the new learnt alphabet to the server and
     * navigate to the Language Portal.
     */
    async #navigateToLanguagePortal() {
        let langStr = await LanguageManager.getTranslation("finishedassociatingverbs");
        this.#View.createToast(langStr);

        let languagePortalCtrl = new LanguagePortalController(this.#currentLanguage);
    }
}

const VERBS_URL = "./verbs/";