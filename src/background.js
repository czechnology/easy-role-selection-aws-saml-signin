chrome.runtime.onMessage.addListener(function(message) {
    switch (message.action) {
        case "openOptionsPage":
            openOptionsPage();
            break;
        default:
            break;
    }
});

function openOptionsPage(){
    if (typeof browser !== "undefined") {
        browser.runtime.openOptionsPage();
    } else if (typeof chrome !== "undefined") {
        chrome.runtime.openOptionsPage();
    } else {
        alert("Unsupported browser");
    }
}

browser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.query == "container") {
            tab = sender.tab;
            sendResponse(browser.contextualIdentities.get(tab.cookieStoreId));
        } else {
            sendResponse({error: "Invalid query"})
        }
    }
);
