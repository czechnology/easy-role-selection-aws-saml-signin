function restoreOptions() {
    key = "favouriteAccounts";
    chrome.storage.sync.get(key, (res) => {
        favouriteAccounts = res[key] || [];
        input = document.querySelector("#favourite-accounts-input");
        input.value = favouriteAccounts.join("\n");
    });
}

function saveOptions(e) {
    clearTimeout(resultTimeout);
    resultNode.textContent = "";

    input = document.querySelector("#favourite-accounts-input");
    favouriteAccountsStr = input.value.trim();
    if (favouriteAccountsStr == "") {
        favouriteAccounts = [];
    } else {
        favouriteAccounts = favouriteAccountsStr.split("\n");
    }
    chrome.storage.sync.set({
        favouriteAccounts: favouriteAccounts
    });
    e.preventDefault();
    restoreOptions();

    resultNode.textContent = "Options saved!";
    resultTimeout = setTimeout(function(){resultNode.textContent = "";}, 3000);
}

var resultNode = document.querySelector("#save-result");
var resultTimeout;
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("textarea").addEventListener("change", saveOptions);
