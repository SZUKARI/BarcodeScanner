sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ushell/services/CrossApplicationNavigation",
    "project1/model/models"
], (UIComponent, CrossApplicationNavigation, models) => {
    "use strict";

    return UIComponent.extend("project1.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ],
            config: {
                fullWidth: true
            }
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // Initialize router if needed
            // this.getRouter().initialize();
        },

        /**
         * Required for Cross Application Navigation
         */
        getCrossApplicationNavigation: function() {
            return sap.ushell && sap.ushell.Container ? 
                   sap.ushell.Container.getService("CrossApplicationNavigation") : 
                   null;
        }
    });
});