sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/m/MessageBox", "sap/ushell/Container"],
  function (Controller, MessageToast, MessageBox, Container) {
    "use strict";

    return Controller.extend("project1.controller.App", {
      _getText: function (sKey, aParams) {
        return this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText(sKey, aParams);
      },

      onSubmit: function () {
        var oView = this.getView();
        var sHU = oView.byId("uhInput").getValue().trim();
        var sWC = oView.byId("wcInput").getValue().trim();

        if (!sHU || !sWC) {
          MessageBox.error(this._getText("errorFields"));
          return;
        }

        var oModel = oView.getModel();
        var sPath = "/InspLotSet(HandlingUnit='" + encodeURIComponent(sHU) + "',WorkCenter='" + encodeURIComponent(sWC) + "')";
        
        oModel.read(sPath, {
          success: function (oData) {
            if (oData && oData.InspLotResult) {
              var sInspectionLot = oData.InspLotResult;
              MessageToast.show("Inspektionslos gefunden: " + sInspectionLot);
              
              this._navigateToInspectionLotApp(sInspectionLot);
              
              oView.byId("uhInput").setValue("");
              oView.byId("wcInput").setValue("");
            } else {
              MessageBox.error("Kein Inspection Lot gefunden.");
            }
          }.bind(this),
          error: function (oError) {
            console.error("OData Error Details:", oError);
            var sErrorMsg = "Fehler beim Lesen der Daten: " + (oError.message || "Unbekannter Fehler");
            MessageBox.error(sErrorMsg);
          }
        });
      },

      // Korrekte Cross Application Navigation
      _navigateToInspectionLotApp: function(sInspectionLot) {
        // Prüfen ob wir im Fiori Launchpad sind
        if (window.sap && window.sap.ushell && window.sap.ushell.Container) {
          this._navigateWithCrossAppNav(sInspectionLot);
        } else {
    
        }
      },

      _navigateToInspectionLotApp: async function(sInspectionLot) {
        try {
          // Prüfen ob wir im Fiori Launchpad sind
          if (!Container) {
            // this._navigateDirectly(sInspectionLot);
            return;
          }

          // Navigation Service asynchron abrufen (wie in der Referenz)
          const oNavigation = await Container.getServiceAsync("Navigation");
          
          // Href erstellen (Referenz-Syntax)
          const sHref = await oNavigation.getHref({
            target: {
              semanticObject: "InspectionLot",  // Wahrscheinlichstes Semantic Object
              action: "manage"                  // Wahrscheinlichste Action
            },
            params: {
              "InspectionLot": sInspectionLot   // Parameter-Name anpassen falls nötig
            }
          }, this.getOwnerComponent());

          console.log("Generierte URL:", sHref);
          
          // Mit der generierten URL navigieren
          window.open(sHref, '_blank');
          MessageToast.show("Navigation zur Inspection Lot App");
          
        } catch (oError) {
          console.error("CrossAppNav Fehler:", oError);
          MessageToast.show("CrossAppNav nicht verfügbar, verwende direkte Navigation");
          
        }
      },

      onScanSuccessHU: function (oEvent) {
        var sResult = oEvent.getParameter("text");
        this.getView().byId("uhInput").setValue(sResult);
        MessageToast.show(this._getText("scanHU", [sResult]));
      },

      onScanSuccessWC: function (oEvent) {
        var sResult = oEvent.getParameter("text");
        this.getView().byId("wcInput").setValue(sResult);
        MessageToast.show(this._getText("scanWC", [sResult]));
      },

      onScanFail: function (oEvent) {
        MessageBox.error(
          this._getText("scanFail", [oEvent.getParameter("message")])
        );
      },

    });
  }
);