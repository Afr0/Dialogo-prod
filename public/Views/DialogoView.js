import LanguageManager from "../LanguageManager.js";

export default class DialogoView {
    #viewElement;

    /**Constructs a new DialogoView instance.
     * @param {string} templateId The ID of the template to use for this view.
     */
    constructor(templateId = "") {
        const existingViews = document.querySelectorAll('div[id*="View"]');
        existingViews.forEach(view => {
            view.remove();
        });

        //Clone the template content.
        let template = document.querySelector("#" + templateId);
        if (template) {
            this.#viewElement = template.content.cloneNode(true).firstElementChild;
            
            if(!document.body.contains(this.#viewElement))
                document.body.appendChild(this.#viewElement);
        }
        else
            console.log("Unable to find the template: " + templateId);
    } 

    /**Create a toast.
     * @param caption The caption of the toast.
     * @param timeout Optional timeout, set to 3500 by default.
     */
    createToast(caption, timeout = 2500) {
        let toast = document.createElement("div");
        toast.classList.add("toast");
        toast.textContent = caption;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, timeout);
    }
    
    /**Create an interactive toast for confirmation.
    * @param caption The caption of the toast.
    * @param confirmCallback Function to call if user confirms.
    * @param cancelCallback Function to call if user cancels.
    */
    async createConfirmationToast(caption, confirmCallback, cancelCallback) {
        let toast = document.createElement("div");
        toast.classList.add("toast");
        
        let text = document.createElement("span");
        text.textContent = caption;
        toast.appendChild(text);
        
        let btnConfirm = document.createElement("button");
        btnConfirm.classList.add("button");
        btnConfirm.textContent = "Bekreft";
        btnConfirm.onclick = async () => {
            if(confirmCallback)
                await confirmCallback();
    
            toast.remove();
        };
        
        let btnCancel = document.createElement("button");
        btnCancel.textContent = "Avbryt";
        btnCancel.classList.add("button");
        btnCancel.onclick = async () => {
            if(cancelCallback)
                await cancelCallback();
    
            toast.remove();
        };
    
        LanguageManager.getTranslation("confirm").then((translation) => {
            btnConfirm.textContent = translation;
        });
    
        LanguageManager.getTranslation("cancel").then((translation) => {
            btnCancel.textContent = translation;
        });
        
        toast.appendChild(btnConfirm);
        toast.appendChild(btnCancel);
        
        document.body.appendChild(toast);
    }
}