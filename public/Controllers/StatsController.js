import DialogoModel from "../DialogoModel.js";
import StatsView from "../Views/StatsView.js";
import IndexController from "../Controllers/IndexController.js";

/**
 * Controller for the Stats view.
 * A controller acts as a bridge between the Model and the View in the MVC pattern.
 * Using a Controller ensures that a Model is never aware of the View and vice
 * versa, ensuring separation of concerns.
 */
export default class StatsController {
    #Model;
    #View;

    /**
     * Constructs an instance of StatsController.
     */
    constructor() {
        this.#Model = new DialogoModel(DialogoModel.USER_CACHE_NAME);
        this.#View = new StatsView(DialogoModel.STATSVIEW_ID.replace("View", "Template"), 
                                    JSON.parse(sessionStorage.getItem(DialogoModel.KNOWNALPHABETS_CACHE_NAME)));
        this.#View.onNavigatingToIndex(() => this.#navigateToIndex());
    }

    /**Event handler for navigating to the index. */
    async #navigateToIndex() {
        await IndexController.createIndexController();
    }
}