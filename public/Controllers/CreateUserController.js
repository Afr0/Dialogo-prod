import DialogoModel from "../DialogoModel.js";
import CreateUserView from "../Views/CreateUserView.js";
import LanguageManager from "../LanguageManager.js";
import IndexController from "../Controllers/IndexController.js";
//node-srp was giving me a LOT of grief because of its insistence on require instead of require,
//so ended up using this instead.
import * as SrpClient from "secure-remote-password/client.js";

/**
 * Controller for the CreateUser view.
 * A controller acts as a bridge between the Model and the View in the MVC pattern.
 * Using a Controller ensures that a Model is never aware of the View and vice
 * versa, ensuring separation of concerns.
 */
export default class CreateUserController {
    #Model;
    #View;

    constructor() {
        this.#Model = new DialogoModel(DialogoModel.USER_CACHE_NAME);
        this.#View = new CreateUserView(DialogoModel.CREATEUSERVIEW_ID.replace("View", "Template"));

        /**Event handler for navigating to the index. */
        async function navigateToIndex() {
            await IndexController.createIndexController();
        }
        
        this.#View.onNavigatingToIndex(() => navigateToIndex());

        let userForm = document.getElementById("userForm");

        userForm.addEventListener("submit", async (event) => {
            //Prevents the browsers default behaviour (such as opening a link), 
            //but does not stop the event from bubbling up the DOM:
            //https://jacobwardio.medium.com/how-to-correctly-use-preventdefault-stoppropagation-or-return-false-on-events-6c4e3f31aedb
            event.preventDefault();
    
            let userName = document.getElementById("txtUsername").value;
            let password = document.getElementById("txtPassword").value;
    
            let salt = SrpClient.generateSalt();
            let privateKey = SrpClient.derivePrivateKey(salt, userName, password);
            let verifier = SrpClient.deriveVerifier(privateKey);
    
            //TODO: Sanity check this - the priority is not great, because the server likely sanity
            //checks whatever it receives.
            this.#Model.postData(CREATEUSER_URL,
                { userName: userName, verifier: verifier, salt: salt }, 
                "application/json", "", "", false).then(async (response) => {
                    history.pushState({ userCreated: true }, '', './index.html?userCreated=true');
                    await IndexController.createIndexController();
                }).catch(async (error) => {
                    this.#View.createToast(await LanguageManager.getTranslation("newuserfailure"));
                    console.error(error);
                });
        }); 
    }
}

const CREATEUSER_URL = "./user";