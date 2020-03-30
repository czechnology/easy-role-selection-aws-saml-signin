function openOptionsPage() {
    chrome.runtime.sendMessage({"action": "openOptionsPage"});
}

function getFavouriteAccounts(onFulfilled) {
    key = "favouriteAccounts";
    chrome.storage.sync.get(key, (res) => {
        onFulfilled(res[key] || []);
    });
}

function rearrangeAccounts(favouriteAccounts) {
    // Changing innerHTML would be easier but causes warning during Firefox addon validation
    pNode = document.querySelector("form > p");
    pNode.style = "color: #066; font-style: italic;"
    pNode.textContent = "";
    aNode = document.createElement("a")
    pNode.appendChild(aNode);
    aNode.href = "#"
    aNode.id = "open-options-page"
    aNode.textContent = "Configure favourite accounts";
    aNode.addEventListener("click", openOptionsPage);
    if (favouriteAccounts.length == 0) {
        pNode.prepend(document.createTextNode(
            "No favourite accounts selected, you can specify them in "));
        aNode.textContent = "addon options";
        return;
    }
    
    var fieldset = document.querySelector("fieldset");
    var samlAccounts = fieldset.children;
    var samlAccountsArray = Array.prototype.slice.call(samlAccounts, 0);
    
    samlAccountsArray.sort(function(a,b) {
        aName = a.querySelector(".saml-account-name").textContent.slice(9,-15);
        bName = b.querySelector(".saml-account-name").textContent.slice(9,-15);
        ia = favouriteAccounts.indexOf(aName);
        ib = favouriteAccounts.indexOf(bName);
        if (ia < 0 && ib >= 0) return 1;
        if (ib < 0 && ia >= 0) return -1;
        diff = ib - ia;
        if (diff != 0) {
            return -diff;
        } else {
            return aName.localeCompare(bName);
        }
    });
    samlAccountsArray.forEach(function(div) {
        // Reorder the nodes
        fieldset.appendChild(div);
        
        // Reformat the account header
        var headerNode = div.getElementsByClassName("saml-account-name")[0];
        var name = headerNode.innerText.slice(9, -15);
        var number = headerNode.innerText.slice(-13, -1);
        headerNode.textContent = "";
        nameNode = document.createElement("span");
        nameNode.className = "name"
        nameNode.textContent = name;
        headerNode.appendChild(nameNode);
        numberNode = document.createElement("span");
        numberNode.className = "number"
        numberNode.textContent = number;
        headerNode.appendChild(numberNode);
        
        // Hide accounts which are not among favourites
        if (favouriteAccounts.indexOf(name) < 0) {
            div.getElementsByClassName("saml-account")[0].style.display = "none";
        }
    });
}

getFavouriteAccounts(rearrangeAccounts);
