import DialogoModel from "./DialogoModel.js";

export default class TemplateManager {
    static templateNames = ["indexTemplate", "languageStartTemplate", "createuserTemplate", 
                            "loginTemplate", "learnAlphabetTemplate", "settingsTemplate",
                            "languageportalTemplate", "learnVerbsTemplate", "associateVerbsTemplate"];
    static templatesDir = "https://" + DialogoModel.CONNECTION_DOMAIN + "Templates/";

    static initializeTemplates() {
        return Promise.all(this.templateNames.map(file => {
            return fetch(this.templatesDir + file + ".html")
                .then(response => {
                    if (!response.ok) 
                        throw new Error(`HTTP error! status: ${response.status}`);
                    return response.text();
                })
                .then(content => {
                    if (document.querySelector("#" + file) === null)
                        document.body.insertAdjacentHTML("beforeend", content);
                })
                .catch(error => {
                    console.error(`Error loading template ${file}: ${error}`);
                });
            })
        );
    }
}
