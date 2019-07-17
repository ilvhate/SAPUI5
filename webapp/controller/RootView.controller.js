sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel"
], function (Controller, ODataModel, JSONModel) {
	"use strict";

	return Controller.extend("com.mtk.jingTestUI5.controller.RootView", {
		onInit: function () {
			//var userId = new sap.ushell.Container.getService("UserInfo").getId();
			//sap.m.MessageToast.show(userId);
			var _this = this;
			// get Current User Info from FrontEnd Server
			var _view = this.getView();
			var oModelUser = new JSONModel();
			oModelUser.loadData("/sap/bc/ui2/start_up");
			oModelUser.attachRequestCompleted(function () {
				//console.log(oModel_User.getData());
				_view.setModel(oModelUser, "userInfo");
				_view.bindElement("userInfo/");
			});

			// get current user cookie from EPortal
			var epDomain = "";
			if (window.location.hostname.indexOf("hanatrial") === -1) {
				epDomain = "https://mtkept5.mediatek.inc:50101";
			}
			/*			var oModelCookie = new JSONModel();
						oModel_cookie.loadData(epDomain + "/wdacaller/fetch_ticket.jsp");
						oModel_cookie.attachRequestCompleted(function () {
							//console.log(oModel_cookie.getData());
							_view.setModel(oModel_cookie, "cookie");
							_view.bindElement("cookie/");
						});*/

			/*				var createCORSRequest = function (method, url) {
								var xhr = new XMLHttpRequest();
								if ("withCredentials" in xhr) {
									// Most browsers.
									xhr.open(method, url, true);
								} else if (typeof XDomainRequest !== "undefined") {
									// IE8 & IE9
									xhr = new XDomainRequest();
									xhr.open(method, url);
								} else {
									// CORS not supported.
									xhr = null;
								}
								return xhr;
							};*/

			var url = epDomain + "/wdacaller/fetch_ticket.jsp";
			/*				var method = 'GET';
							var xhr = createCORSRequest(method, url);
							xhr.onload = function () {
								console.log("Success code goes here.");
								console.log(xhr.responseText);
								oModel_cookie.setJSON(xhr.responseText);
								_view.setModel(oModel_cookie, "cookie");
								_view.bindElement("cookie/");
							};
							xhr.onerror = function () {
								console.log(" Error code goes here.");
							};
							xhr.withCredentials = true;
							xhr.send();*/

			// get JSON via jQuery ajax function instead of XMLHttpRequest(but jQuery won't support IE8 & IE9)
			$.ajax({
					url: url,
					xhrFields: {
						withCredentials: true
					},
					dataType: "JSON"
				})
				.done( function(data){
					console.log("Sucess get ajax request-->" + JSON.stringify(data));
					_this.onTicketReturned(data);
				} )
				.fail(function (jqXHR, textStatus) {
					console.log("fail get ajax request-->" + textStatus);
				});

		},
		onModelRefresh: function () {
			//console.log("refresh model");
			this.getTable().getBinding().refresh(true);
		},
		getTable: function () {
			return this.getView().byId("bpTable");
		},
		initBindingEventHandler: function () {
			var oBusyIndicator = this.oBusyIndicator;
			var oTable = this.getTable();
			var oBinding = oTable.getBinding("rows");

			oBinding.attachDataRequested(function () {
				oTable.setNoData(oBusyIndicator);
			});
			oBinding.attachDataReceived(function () {
				oTable.setNoData(null); //Use default again ("No Data" in case no data is available)
			});
		},
		onExit: function () {
			this.oBusyIndicator.destroy();
			this.oBusyIndicator = null;
		},
		onTicketReturned: function (data) {
			var oModelCookie = new JSONModel();
			oModelCookie.setData(data);
			this.getView().setModel(oModelCookie, "cookie");
			this.getView().bindElement("cookie/");
			console.log("call BP Odata");
			var oModelBP = new ODataModel("/sap/opu/odata/sap/Z_JING_C_SALESORDER_TX_CDS");
			oModelBP.setHeaders(data);
			var oTable = this.getTable();
			this.oBusyIndicator = oTable.getNoData();
			oTable.setModel(oModelBP);
			oTable.bindRows("/SEPM_I_BusinessPartner");
			this.initBindingEventHandler();
		}
	});
});