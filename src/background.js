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
        alert('Unsupported browser');
    }
}
