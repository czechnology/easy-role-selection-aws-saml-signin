async function restoreOptions() {
    keys = ["favouriteAccounts", "autoLogin"];
    options = await chrome.storage.sync.get(keys);

    // Favourite Accounts option
    favouriteAccounts = res[keys[0]] || [];
    input = document.querySelector("#favourite-accounts-input");
    input.value = favouriteAccounts.join("\n");

    // Auto-Login option
    autoLogin = res[keys[1]];
    input = document.querySelector("#auto-login-input");
    input.checked = autoLogin === true;
}

function saveOptions(e) {
    clearTimeout(resultTimeout);
    resultNode.textContent = "";

    // Favourite Accounts option
    input = document.querySelector("#favourite-accounts-input");
    favouriteAccountsStr = input.value.trim();
    if (favouriteAccountsStr == "") {
        favouriteAccounts = [];
    } else {
        favouriteAccounts = favouriteAccountsStr.split("\n");
    }

    // Auto-Login Role option
    input = document.querySelector("#auto-login-input");
    autoLogin = input.checked;

    // Save options
    chrome.storage.sync.set({
        favouriteAccounts: favouriteAccounts,
        autoLogin: autoLogin
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
document.querySelector("input[type=checkbox]").addEventListener("change", saveOptions);
