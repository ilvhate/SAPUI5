sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/export/Spreadsheet"
], function (Controller, ODataModel, JSONModel, Spreadsheet) {
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
			// resolve launchpad CORS issue [request header : x-xhr-logon not allow]; override XMLHTTPRequest.send 
			this._overrideRequestPrototype();
			// get JSON via jQuery ajax function instead of XMLHttpRequest(but jQuery won't support IE8 & IE9)
			$.ajax({
					url: url,
					xhrFields: {
						withCredentials: true
					},
					dataType: "JSON"
				})
				.done(function (data) {
					console.log("Sucess get ajax request-->" + JSON.stringify(data));
					_this.onTicketReturned(data);
				})
				.fail(function (jqXHR, textStatus) {
					console.log("fail get ajax request-->" + textStatus);
				});
			// restore XMLHTTPRequest.send method
			this._restoreRequestPrototype();
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
			//get metadata label in English
			var oModelBP = new ODataModel("/sap/opu/odata/sap/Z_JING_C_SALESORDER_TX_CDS", {
				metadataUrlParams: {
					"sap-language": "en"
				}
			});
			oModelBP.setHeaders(data);
			//console.log($.sap.log.Level.ERROR);
			var oTable = this.getTable();
			this.oBusyIndicator = oTable.getNoData();
			oTable.setModel(oModelBP);
			oTable.bindRows("/SEPM_I_BusinessPartner");
			this.initBindingEventHandler();
		},
		onExcelExport: function () {
			var aCols, oRowBinding, oSettings, oTable;
			oTable = this.getTable();
			oRowBinding = oTable.getBinding("rows"); //this is important! bindingInfo

			aCols = this.createColumnConfig();

			var oModel = oTable.getModel();
			var oModelInterface = oModel.getInterface();

			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: {
					type: "oData",
					dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
					serviceUrl: oModelInterface.sServiceUrl,
					headers: oModelInterface.getHeaders ? oModelInterface.getHeaders() : null,
					count: oRowBinding.getLength ? oRowBinding.getLength() : null,
					useBatch: oModelInterface.bUseBatch,
					sizeLimit: oModelInterface.iSizeLimit
				},
				worker: true,
				fileName: "Business Partner.xlsx"
			};

			new Spreadsheet(oSettings).build();
		},
		createColumnConfig: function () {
			var aCols = [];

			aCols.push({
				label: "Business Partner",
				type: "string",
				property: "CompanyName"
			});

			aCols.push({
				label: "Business Partner ID",
				property: "BusinessPartner",
				type: "string"
			});

			aCols.push({
				label: "Phone Number",
				property: "PhoneNumber",
				type: "string"
			});

			aCols.push({
				label: "Email Address",
				property: "EmailAddress",
				type: "string"
			});

			aCols.push({
				property: "URL",
				type: "string"
			});

			aCols.push({
				property: "Currency",
				type: "string"
			});

			/*			aCols.push({
							label: 'Full name',
							property: ['Lastname', 'Firstname'],
							type: 'string',
							template: '{0}, {1}'
						});

						aCols.push({
							property: 'Salary',
							type: 'number',
							scale: 2,
							delimiter: true
						});*/

			/*			aCols.push({
							property: 'Active',
							type: 'boolean',
							trueValue: 'YES',
							falseValue: 'NO'
						});
			*/
			return aCols;
		},

		_overrideRequestPrototype: function () {
			if (!XMLHttpRequest._SAP_ENHANCED) {
				return;
			}
			this.__send = XMLHttpRequest.prototype.send;
			XMLHttpRequest.prototype.send = function (oBody) {
				let oChannel = {};
				this._checkEventSubscriptions();
				try {
					oChannel = this._channel;
					this._saveParams(oBody);
					this._send(oBody);
					if (oChannel) {
						oChannel.sent();
					}
				} catch (oError) {
					if (oChannel) {
						oChannel["catch"](oError);
					} else {
						throw oError;
					}
				}
			};
		},
		_restoreRequestPrototype: function () {
			if (!XMLHttpRequest._SAP_ENHANCED) {
				return;
			}
			XMLHttpRequest.prototype.send = this.__send;
		}
	});
});