/* global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"com/mtk/jingTestUI5_15/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/mtk/jingTestUI5_15/test/integration/pages/RootView",
	"com/mtk/jingTestUI5_15/test/integration/navigationJourney"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.mtk.jingTestUI5_15.view.",
		autoWait: true
	});
});