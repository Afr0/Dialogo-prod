import DialogoView from "./DialogoView.js";
import LanguageManager from "../LanguageManager.js";

export default class CreateUserView extends DialogoView {
    #backBtn;
    #btnRegister;

    #navigateToIndexCallback;

    constructor(viewID="") {
        super(viewID);

        let title = document.getElementById("Header");
        this.#btnRegister = document.getElementById("btnRegister");
        LanguageManager.getTranslation("newuser").then((translation) => {
            title.textContent = translation;
            this.#btnRegister.textContent = translation;
        });

        let lblUsername = document.getElementById("lblUsername");
        let lblPassword = document.getElementById("lblPassword");
        LanguageManager.getTranslation("username").then((translation) => {
            lblUsername.textContent = translation;
        });
        LanguageManager.getTranslation("password").then((translation) => {
            lblPassword.textContent = translation;
        });

        this.#backBtn = document.getElementsByClassName("backButton")[0];
        if(this.#backBtn) {
            this.#backBtn.addEventListener("click", async () => {
                await this.#navigateToIndexCallback();
            });
        }
    }

    onNavigatingToIndex(callback) {
        this.#navigateToIndexCallback = callback;
    }
 }