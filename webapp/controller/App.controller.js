sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/m/MessageBox", "sap/ushell/Container"],
  function (Controller, MessageToast, MessageBox, Container) {
    "use strict";

    return Controller.extend("project1.controller.App", {
      _getText: function (sKey, aParams) {
        return this.getView().getModel("i18n").getResourceBundle().getText(sKey, aParams);
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
        var sPath = `/InspLotSet(IvHandlingUnit='${encodeURIComponent(sHU)}',IvWorkCenter='${encodeURIComponent(sWC)}')`;

        oModel.read(sPath, {
          success: function (oData) {
            // Prüfen auf EvErrorMessage zuerst
            if (oData && oData.EvErrorMessage) {
              MessageBox.error(oData.EvErrorMessage);
              oView.byId("uhInput").setValue("");
              oView.byId("wcInput").setValue("");
              return;
            }

            // Wenn EvInspectionLot vorhanden → Navigation
            if (oData && oData.EvInspectionLot) {
              var sInspectionLot = oData.EvInspectionLot;
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

      _navigateToInspectionLotApp: async function (sInspectionLot) {
        if (sap.ushell && sap.ushell.Container) {
          try {
            const oCrossAppNav = await sap.ushell.Container.getServiceAsync("CrossApplicationNavigation");
            oCrossAppNav.toExternal({
              target: {
                semanticObject: "InspectionLot",
                action: "manage"
              },
              params: {
                "InspectionLot": sInspectionLot
              }
            });
          } catch (err) {
            console.error("Navigation Service Fehler:", err);
            MessageBox.error("Fehler bei der Navigation: " + (err.message || err));
          }
        } else {
          var sUrl = `#InspectionLot-manage?InspectionLot=${encodeURIComponent(sInspectionLot)}`;
          window.location.href = sUrl;
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
        MessageBox.error(this._getText("scanFail", [oEvent.getParameter("message")]));
      },
      onNavBack: function () {
        var oHistory = sap.ui.core.routing.History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          sap.ushell.Container.getServiceAsync(
            "CrossApplicationNavigation"
          ).then(function (oCrossAppNav) {
            oCrossAppNav.toExternal({ target: { shellHash: "#" } });
          });
        }
      },
    });
  }
);
