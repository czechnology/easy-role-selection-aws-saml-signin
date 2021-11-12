function createElement(tagName, attributes, children) {
    el = document.createElement(tagName)
    if (attributes !== undefined) {
        for (var attr in attributes) {
            el[attr] = attributes[attr];
        }
    }
    if (children !== undefined) {
        for (var i in children) {
            el.append(children[i]);
        }
    }
    return el;
}

function openOptionsPage() {
    chrome.runtime.sendMessage({"action": "openOptionsPage"});
}

function expandAccount(div) {
    div.querySelector(".saml-account").style.display = "";
    div.querySelector("img").src = '/static/image/down.png';
}
function collapseAccount(div) {
    div.querySelector(".saml-account").style.display = "none";
    div.querySelector("img").src = '/static/image/up.png';
    div.querySelector("input[type=radio]").checked = false;
}

function expandAllAccounts() {
    document.querySelectorAll("fieldset > .saml-account").forEach(expandAccount);
}
function collapseNonFavouriteAccounts() {
    document.querySelectorAll("fieldset > .saml-account:not(.favourite)").forEach(collapseAccount);
}

function insertFilterInput() {
    var form = document.querySelector("form");
    form.autocomplete = "off";
    var fset = form.querySelector("fieldset");
    var spanNode = document.createElement("span");
    spanNode.className = "input-icon";
    form.insertBefore(spanNode, fset);
    var inputNode = document.createElement("input");
    inputNode.placeholder = "Filter roles:                      "
    inputNode.id = "role-filter-input"
    inputNode.autocomplete = "off";
    form.insertBefore(inputNode, fset);
    inputNode.focus();
    inputNode.addEventListener("keyup", onFilterInputKeyIp);
    // Add help
    var helpIconNode = createElement("span", {"className": "help-icon"});
    var helpTooltipNode = createElement("span", {"className": "help-tooltip"});
    var helpExNode = createElement("span", {"className": "help-ex"}, [helpIconNode, helpTooltipNode])
    helpTooltipNode.append(document.createTextNode("Filter roles by specifying part(s) of role names."));
    helpTooltipNode.append(createElement('br'));
    helpTooltipNode.append(document.createTextNode("Separate multiple filters by whitespace."));
    helpTooltipNode.append(createElement('br'));
    helpTooltipNode.append(document.createTextNode("Use Up/Down arrow keys to navigate over the visible roles."));
    helpTooltipNode.append(createElement('br'));
    helpTooltipNode.append(document.createTextNode("Press Enter key to sign in using selected role."));
    form.insertBefore(helpExNode, fset);
}

function onFilterInputKeyIp(event) {
    switch (event.code) {
        case "ArrowDown": selectNextRole(false); break;
        case "ArrowUp": selectNextRole(true); break;
        default: filterRoles();
    }
}

function selectNextRole(backwards) {
    var allRadios = Array.from(document.querySelectorAll("input[type=radio]"));
    var visibleRadios = allRadios
        .filter(r => r.parentElement.style.display != "none")
        .filter(r => r.parentElement.parentElement.style.display != "none");
    radiosCount = visibleRadios.length;
    if (radiosCount == 0) return;

    var currentlyCheckedIndex = -1;
    for (var i = 0; i < radiosCount; i++) {
        if (visibleRadios[i].checked) {
            currentlyCheckedIndex = i;
            break;
        }
    }
    if (currentlyCheckedIndex == -1) {
        nextIndex = backwards ? radiosCount - 1 : 0;
    } else {
        nextIndex = (currentlyCheckedIndex + (backwards ? radiosCount - 1 : 1)) % radiosCount;
    }
    visibleRadios[nextIndex].checked = true;
}

function selectRole(roleName) {
    var matchingRolesElements = [...document.querySelectorAll(".saml-role")].filter(
        div => div.querySelector("label.saml-role-description").textContent.toLowerCase().includes(roleName)
    );
    if (matchingRolesElements.length == 0) {
        console.warning("No role containing " + roleName + " found");
        return false;
    }
    if (matchingRolesElements.length > 1) {
        console.warning("Multiple roles containing " + roleName + " found");
        return false;
    }

    matchingRolesElements[0].querySelector("input[type=radio]").checked = true;
    expandAccount(matchingRolesElements[0].parentElement.parentElement);
    return true
}

function filterRoles() {
    var inputNode = document.querySelector("#role-filter-input");
    var filterParts = inputNode.value.toLowerCase().match(/\S+/g);
    visibleRolesCount = 0
    var rolesElements = document.querySelectorAll(".saml-role");
    rolesElements.forEach(function(div) {
        roleName = div.querySelector("label").textContent.toLowerCase();
        if (filterParts === null) {
            filterMatches = true;
        } else {
            filterMatches = filterParts
                    .map(p => roleName.indexOf(p) >= 0)
                    .reduce((x, y) => x && y);
        }
        div.style.display = filterMatches ? "" : "none";
        if (filterMatches) {
            visibleRolesCount += 1;
        } else {
            div.querySelector("input[type=radio]").checked = false;
        }
    });
    if (filterParts === null) {
        collapseNonFavouriteAccounts();
    } else {
        expandAllAccounts();
    }
    if (visibleRolesCount == 1) {
        selectNextRole();  // select the only visible role
    }
}

async function onContainerInfo(container) {
    if (container.name === undefined) {
        console.warning("Container name not available.");
        return;
    }

    var roleFound = selectRole(container.name);
    if (!roleFound) return;

    res = await chrome.storage.sync.get("autoLogin");
    autoLogin = res["autoLogin"];
    if (autoLogin) {
        document.querySelector("form#saml_form").submit();
    }
}

async function rearrangeAccounts() {
    var res = await chrome.storage.sync.get("favouriteAccounts");
    var favouriteAccounts = res["favouriteAccounts"] || [];

    // Changing innerHTML would be easier but causes warning during Firefox addon validation
    pNode = document.querySelector("form#saml_form > p");
    pNode.style = ""
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
    var samlAccounts = document.querySelectorAll("fieldset > .saml-account");
    var samlAccountsArray = Array.from(samlAccounts);
    
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
        var headerNode = div.querySelector(".saml-account-name");
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
        
        // Mark favourite accounts
        if (favouriteAccounts.indexOf(name) >= 0) {
            div.classList.add("favourite");
        }
        // Collapse accounts which are not among favourites
        else {
            collapseAccount(div);
        }
    });
}

async function main() {
    rearrangeAccounts();
    chrome.runtime.sendMessage({query: "container"}, onContainerInfo);
}

insertFilterInput();
main();
