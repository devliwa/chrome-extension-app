import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js"
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js"

const firebaseConfig = {
    databaseURL: process.env.DATABASE_URL
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

console.log(firebaseConfig.databaseURL)

let myLeads = []
const inputEl = document.getElementById("input-el")
const inputBtn = document.getElementById("input-btn")
const ulEl = document.getElementById("ul-el")
const deleteBtn = document.getElementById("delete-btn")
const tabBtn = document.getElementById("tab-btn")
const emptyStateEl = document.getElementById("empty-state")
const statusMsgEl = document.getElementById("status-msg")

const leadsFromLocalStorage = JSON.parse(localStorage.getItem("myLeads"))

if (leadsFromLocalStorage) {
    myLeads = leadsFromLocalStorage
    render(myLeads)
} else {
    updateEmptyState()
}

tabBtn.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0] && tabs[0].url) {
            myLeads.push(tabs[0].url)
            saveAndRender()
            showStatus("Tab URL saved!")
        }
    })
})

function showStatus(msg) {
    statusMsgEl.textContent = msg
    statusMsgEl.classList.add("show")
    setTimeout(() => {
        statusMsgEl.classList.remove("show")
    }, 2000)
}

function updateEmptyState() {
    if (myLeads.length === 0) {
        emptyStateEl.classList.add("show")
        ulEl.style.display = "none"
    } else {
        emptyStateEl.classList.remove("show")
        ulEl.style.display = "block"
    }
}

function render(leads) {
    let listItems = ""
    for (let i = 0; i < leads.length; i++) {
        listItems += `
            <li>
                <div class="lead-content">
                    <a target='_blank' href='${leads[i]}' title="${leads[i]}">
                        ${leads[i]}
                    </a>
                </div>
                <div class="actions">
                    <span class="icon-btn copy" data-index="${i}" title="Copy to clipboard">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </span>
                    <span class="icon-btn delete" data-index="${i}" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </span>
                </div>
            </li>
        `
    }
    ulEl.innerHTML = listItems
    updateEmptyState()

    // Add event listeners
    document.querySelectorAll(".delete").forEach(btn => {
        btn.addEventListener("click", function (e) {
            const index = this.getAttribute("data-index")
            deleteLead(index)
        })
    })

    document.querySelectorAll(".copy").forEach(btn => {
        btn.addEventListener("click", function (e) {
            const index = this.getAttribute("data-index")
            copyToClipboard(leads[index])
        })
    })
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showStatus("Copied to clipboard!")
    })
}

function deleteLead(index) {
    myLeads.splice(index, 1)
    saveAndRender()
    showStatus("Lead removed")
}

function saveAndRender() {
    localStorage.setItem("myLeads", JSON.stringify(myLeads))
    render(myLeads)
}

deleteBtn.addEventListener("dblclick", function () {
    localStorage.clear()
    myLeads = []
    render(myLeads)
    showStatus("All leads cleared")
})

inputBtn.addEventListener("click", function () {
    if (inputEl.value) {
        myLeads.push(inputEl.value)
        inputEl.value = ""
        saveAndRender()
        showStatus("Input saved!")
    }
})