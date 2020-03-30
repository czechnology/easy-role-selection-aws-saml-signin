function restoreOptions() {
    key = "favouriteAccounts";
    chrome.storage.sync.get(key, (res) => {
        favouriteAccounts = res[key] || [];
        input = document.querySelector("#favourite-accounts-input");
        input.value = favouriteAccounts.join("\n");
    });
}

function saveOptions(e) {
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
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
