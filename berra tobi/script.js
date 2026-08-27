/* =========================================================
   INTELLIGENCE OSINT ENGINE
   SCRIPT.JS
   ========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const targetInput = document.getElementById("target");
const investigateBtn = document.getElementById("investigate");

const targetButtons = document.querySelectorAll(".target-type");

const targetFormat = document.getElementById("target-format");

const resultsEmpty = document.getElementById("results-empty");
const resultsContent = document.getElementById("results-content");

const resultTarget = document.getElementById("result-target");
const resultType = document.getElementById("result-type");
const resultStatus = document.getElementById("result-status");

const dynamicResults = document.getElementById("dynamic-results");

const scanStatus = document.getElementById("scan-status");

const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history");

const caseIdElement = document.getElementById("case-id");

const yearElement = document.getElementById("year");


/* =========================================================
   CURRENT TARGET TYPE
========================================================= */

let currentTargetType = "username";


/* =========================================================
   TARGET CONFIGURATION
========================================================= */

const targetConfig = {

    username: {
        label: "USERNAME",
        placeholder: "Enter username...",
        description: "Enter a username to investigate"
    },

    phone: {
        label: "PHONE NUMBER",
        placeholder: "Enter phone number...",
        description: "Enter a phone number with country code"
    },

    email: {
        label: "EMAIL ADDRESS",
        placeholder: "Enter email address...",
        description: "Enter an email address to investigate"
    },

    ip: {
        label: "IP ADDRESS",
        placeholder: "Enter IP address...",
        description: "Enter an IPv4 or IPv6 address"
    },

    domain: {
        label: "DOMAIN",
        placeholder: "Enter domain name...",
        description: "Enter a domain such as example.com"
    },

    location: {
        label: "LOCATION",
        placeholder: "Enter location...",
        description: "Enter a city, region or location"
    }

};


/* =========================================================
   YEAR
========================================================= */

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


/* =========================================================
   TARGET TYPE SWITCHING
========================================================= */

targetButtons.forEach(button => {

    button.addEventListener("click", () => {

        targetButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        currentTargetType = button.dataset.type;

        updateTargetInterface();

        targetInput.focus();

    });

});


/* =========================================================
   UPDATE TARGET INTERFACE
========================================================= */

function updateTargetInterface() {

    const config = targetConfig[currentTargetType];

    if (!config) return;

    targetInput.placeholder = config.placeholder;

    targetFormat.textContent = config.description;

    targetInput.value = "";

    resetResults();

}


/* =========================================================
   INPUT VALIDATION
========================================================= */

function validateTarget(target, type) {

    if (!target) {

        return {
            valid: false,
            message: "Please enter a target."
        };

    }


    if (type === "email") {

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(target)) {

            return {
                valid: false,
                message: "Enter a valid email address."
            };

        }

    }


    if (type === "ip") {

        const ipv4Pattern =
            /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

        if (!ipv4Pattern.test(target)) {

            return {
                valid: false,
                message: "Enter a valid IPv4 address."
            };

        }

    }


    if (type === "domain") {

        const domainPattern =
            /^(?!https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

        if (!domainPattern.test(target)) {

            return {
                valid: false,
                message: "Enter a valid domain name."
            };

        }

    }


    return {
        valid: true
    };

}


/* =========================================================
   GENERATE CASE ID
========================================================= */

function generateCaseId() {

    const number = Math.floor(
        1000 + Math.random() * 9000
    );

    return `CASE-INT-${number}`;

}


/* =========================================================
   ANALYZE TARGET
========================================================= */

investigateBtn.addEventListener("click", analyzeTarget);


targetInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {

        analyzeTarget();

    }

});


async function analyzeTarget() {

    const target = targetInput.value.trim();

    const validation =
        validateTarget(target, currentTargetType);


    if (!validation.valid) {

        showError(validation.message);

        return;

    }


    const caseId = generateCaseId();

    caseIdElement.textContent = caseId;


    setScanningState();


    /*
     * =====================================================
     * BACKEND CONNECTION
     *
     * The Python/FastAPI backend will eventually receive:
     *
     * /api/username
     * /api/phone
     * /api/email
     * /api/ip
     * /api/domain
     * /api/location
     *
     * For now, we use the frontend preparation below.
     * =====================================================
     */


    try {

        const data = await requestBackend(
            currentTargetType,
            target
        );

        displayResults(
            target,
            currentTargetType,
            data
        );

        saveInvestigation(
            target,
            currentTargetType,
            caseId
        );

    } catch (error) {

        console.error(error);

        showBackendMessage();

    }

}


/* =========================================================
   BACKEND REQUEST
========================================================= */

async function requestBackend(type, target) {

    /*
     * This URL will point to the Python/FastAPI server
     * when the backend is deployed.
     *
     * Example:
     *
     * https://your-backend-domain.com/api/username
     *
     */


    const backendBaseURL = "";

    const endpoint =
        `${backendBaseURL}/api/${type}?target=${encodeURIComponent(target)}`;


    /*
     * Backend is not connected yet.
     *
     * This prevents the interface from pretending that
     * fake intelligence results are real.
     */


    if (!backendBaseURL) {

        await delay(1200);

        return {
            backendReady: false
        };

    }


    const response = await fetch(endpoint, {

        method: "GET",

        headers: {
            "Accept": "application/json"
        }

    });


    if (!response.ok) {

        throw new Error(
            `Backend error: ${response.status}`
        );

    }


    return await response.json();

}


/* =========================================================
   DISPLAY RESULTS
========================================================= */

function displayResults(target, type, data) {

    resultsEmpty.hidden = true;

    resultsContent.hidden = false;

    resultTarget.textContent = target;

    resultType.textContent =
        targetConfig[type].label;

    resultStatus.textContent =
        data && data.backendReady === false
            ? "BACKEND PENDING"
            : "ANALYZED";


    if (data && data.backendReady === false) {

        dynamicResults.innerHTML = `

            <div class="result-card">

                <h3>
                    <i class="fa-solid fa-server"></i>
                    INTELLIGENCE ENGINE
                </h3>

                <div class="result-row">

                    <span>Frontend</span>

                    <strong>ONLINE</strong>

                </div>

                <div class="result-row">

                    <span>Target</span>

                    <strong>${escapeHTML(target)}</strong>

                </div>

                <div class="result-row">

                    <span>Module</span>

                    <strong>${escapeHTML(targetConfig[type].label)}</strong>

                </div>

                <div class="result-row">

                    <span>Backend</span>

                    <strong>AWAITING CONNECTION</strong>

                </div>

            </div>

            <div class="result-card">

                <h3>
                    <i class="fa-solid fa-circle-info"></i>
                    SYSTEM MESSAGE
                </h3>

                <p style="color:#667085;font-size:.8rem;">
                    The interface is ready. The Python OSINT
                    backend will be connected next so that
                    real authorized public-source intelligence
                    can be processed.
                </p>

            </div>

        `;

        setReadyState();

        return;

    }


    renderBackendResults(data);

    setReadyState();

}


/* =========================================================
   RENDER REAL BACKEND RESULTS
========================================================= */

function renderBackendResults(data) {

    dynamicResults.innerHTML = "";


    if (!data || typeof data !== "object") {

        dynamicResults.innerHTML = `

            <div class="result-card">

                <h3>NO DATA RETURNED</h3>

                <p style="color:#667085;font-size:.8rem;">
                    The intelligence provider returned no
                    usable public information.
                </p>

            </div>

        `;

        return;

    }


    /*
     * The backend can return structured sections such as:
     *
     * {
     *   summary: {...},
     *   profiles: [...],
     *   network: {...},
     *   location: {...}
     * }
     */


    Object.entries(data).forEach(([section, value]) => {

        if (
            section === "backendReady" ||
            value === null ||
            value === undefined
        ) {
            return;
        }


        const card =
            document.createElement("div");

        card.className = "result-card";


        const title =
            document.createElement("h3");

        title.textContent =
            formatTitle(section);


        card.appendChild(title);


        if (
            typeof value === "object" &&
            !Array.isArray(value)
        ) {

            Object.entries(value).forEach(
                ([key, item]) => {

                    card.appendChild(
                        createResultRow(
                            formatTitle(key),
                            item
                        )
                    );

                }
            );

        } else if (Array.isArray(value)) {

            value.forEach(item => {

                const row =
                    document.createElement("div");

                row.className = "result-row";

                row.innerHTML = `
                    <span>Possible Match</span>
                    <strong>
                        ${escapeHTML(
                            typeof item === "object"
                                ? JSON.stringify(item)
                                : String(item)
                        )}
                    </strong>
                `;

                card.appendChild(row);

            });

        } else {

            card.appendChild(
                createResultRow(
                    "Result",
                    value
                )
            );

        }


        dynamicResults.appendChild(card);

    });

}


/* =========================================================
   CREATE RESULT ROW
========================================================= */

function createResultRow(label, value) {

    const row =
        document.createElement("div");

    row.className = "result-row";


    const labelElement =
        document.createElement("span");

    labelElement.textContent = label;


    const valueElement =
        document.createElement("strong");

    valueElement.textContent =
        value === null || value === undefined
            ? "—"
            : String(value);


    row.appendChild(labelElement);

    row.appendChild(valueElement);


    return row;

}


/* =========================================================
   FORMATTING
========================================================= */

function formatTitle(value) {

    return String(value)
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}


/* =========================================================
   SCANNING STATE
========================================================= */

function setScanningState() {

    investigateBtn.disabled = true;

    investigateBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        ANALYZING...
    `;

    scanStatus.innerHTML = `
        <span class="status-dot"></span>
        SCANNING
    `;

    scanStatus.style.color = "#b7791f";

}


/* =========================================================
   READY STATE
========================================================= */

function setReadyState() {

    investigateBtn.disabled = false;

    investigateBtn.innerHTML = `
        <i class="fa-solid fa-crosshairs"></i>
        ANALYZE TARGET
    `;

    scanStatus.innerHTML = `
        <span class="status-dot"></span>
        READY
    `;

    scanStatus.style.color = "";

}


/* =========================================================
   ERROR STATE
========================================================= */

function showError(message) {

    resultsEmpty.hidden = false;

    resultsContent.hidden = true;


    resultsEmpty.innerHTML = `

        <div class="empty-icon">

            <i class="fa-solid fa-triangle-exclamation"></i>

        </div>

        <h3>Invalid Target</h3>

        <p>
            ${escapeHTML(message)}
        </p>

    `;

}


/* =========================================================
   BACKEND NOT CONNECTED
========================================================= */

function showBackendMessage() {

    resultsEmpty.hidden = true;

    resultsContent.hidden = false;

    resultTarget.textContent =
        targetInput.value.trim();

    resultType.textContent =
        targetConfig[currentTargetType].label;

    resultStatus.textContent =
        "CONNECTION ERROR";


    dynamicResults.innerHTML = `

        <div class="result-card">

            <h3>
                <i class="fa-solid fa-server"></i>
                BACKEND CONNECTION
            </h3>

            <div class="result-row">

                <span>Status</span>

                <strong>
                    UNAVAILABLE
                </strong>

            </div>

            <p style="
                color:#667085;
                font-size:.78rem;
                margin-top:12px;
            ">
                The OSINT backend could not be reached.
                Check the Python server connection and try again.
            </p>

        </div>

    `;

    setReadyState();

}


/* =========================================================
   RESET RESULTS
========================================================= */

function resetResults() {

    resultsEmpty.hidden = false;

    resultsContent.hidden = true;

    resultsEmpty.innerHTML = `

        <div class="empty-icon">

            <i class="fa-solid fa-radar"></i>

        </div>

        <h3>Awaiting Target</h3>

        <p>
            Enter a target above and initiate an analysis
            to begin the investigation.
        </p>

    `;

    scanStatus.innerHTML = `
        <span class="status-dot"></span>
        READY
    `;

    scanStatus.style.color = "";

}


/* =========================================================
   INVESTIGATION HISTORY
========================================================= */

function saveInvestigation(
    target,
    type,
    caseId
) {

    const history =
        getHistory();


    const investigation = {

        target: target,

        type: type,

        caseId: caseId,

        timestamp:
            new Date().toLocaleString()

    };


    history.unshift(investigation);


    /*
     * Keep only the latest 10 investigations.
     */

    const limitedHistory =
        history.slice(0, 10);


    localStorage.setItem(
        "intelligence_osint_history",
        JSON.stringify(limitedHistory)
    );


    renderHistory();

}


/* =========================================================
   GET HISTORY
========================================================= */

function getHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "intelligence_osint_history"
            )
        ) || [];

    } catch {

        return [];

    }

}


/* =========================================================
   RENDER HISTORY
========================================================= */

function renderHistory() {

    const history =
        getHistory();


    if (!history.length) {

        historyList.innerHTML = `

            <div class="history-empty">

                <i class="fa-solid fa-folder-open"></i>

                <p>
                    No investigations recorded.
                </p>

            </div>

        `;

        return;

    }


    historyList.innerHTML = "";


    history.forEach(item => {

        const historyItem =
            document.createElement("div");

        historyItem.className =
            "history-item";


        historyItem.innerHTML = `

            <div>

                <div class="history-target">

                    ${escapeHTML(item.target)}

                </div>

                <div class="history-meta">

                    ${escapeHTML(
                        targetConfig[item.type]?.label ||
                        item.type
                    )}

                    •

                    ${escapeHTML(item.caseId)}

                </div>

            </div>

            <div class="history-meta">

                ${escapeHTML(item.timestamp)}

            </div>

        `;


        historyList.appendChild(
            historyItem
        );

    });

}


/* =========================================================
   CLEAR HISTORY
========================================================= */

clearHistoryBtn.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "intelligence_osint_history"
        );

        renderHistory();

    }
);


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value);

    return div.innerHTML;

}


/* =========================================================
   DELAY
========================================================= */

function delay(milliseconds) {

    return new Promise(resolve => {

        setTimeout(
            resolve,
            milliseconds
        );

    });

}


/* =========================================================
   CURSOR GLOW
========================================================= */

const cursorGlow =
    document.querySelector(".cursor-glow");


document.addEventListener(
    "mousemove",
    event => {

        if (!cursorGlow) return;

        cursorGlow.style.left =
            `${event.clientX}px`;

        cursorGlow.style.top =
            `${event.clientY}px`;

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

renderHistory();

updateTargetInterface();