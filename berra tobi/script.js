document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       INTELLIGENCE OSINT ENGINE
       FRONTEND SCRIPT
       MISSION 006
    ===================================================== */


    /* =====================================================
       BACKEND CONFIGURATION
    ===================================================== */

    /*
       LOCAL DEVELOPMENT:

       http://127.0.0.1:8000

       When the Python backend is deployed later,
       replace this with your real backend URL.

       Example:

       const BACKEND_URL = "https://your-backend.example.com";
    */

    const BACKEND_URL = "http://127.0.0.1:8000";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const targetInput =
        document.getElementById("target");

    const investigateBtn =
        document.getElementById("investigate");

    const targetButtons =
        document.querySelectorAll(".target-type");

    const targetFormat =
        document.getElementById("target-format");

    const resultsEmpty =
        document.getElementById("results-empty");

    const resultsContent =
        document.getElementById("results-content");

    const resultTarget =
        document.getElementById("result-target");

    const resultType =
        document.getElementById("result-type");

    const resultStatus =
        document.getElementById("result-status");

    const dynamicResults =
        document.getElementById("dynamic-results");

    const scanStatus =
        document.getElementById("scan-status");

    const historyList =
        document.getElementById("history-list");

    const clearHistoryBtn =
        document.getElementById("clear-history");

    const caseIdElement =
        document.getElementById("case-id");

    const yearElement =
        document.getElementById("year");


    /* =====================================================
       CURRENT TARGET TYPE
    ===================================================== */

    let currentTargetType = "username";


    /* =====================================================
       TARGET CONFIGURATION
    ===================================================== */

    const targetConfig = {

        username: {
            label: "USERNAME",
            placeholder: "Enter username...",
            description:
                "Enter a username to investigate"
        },

        phone: {
            label: "PHONE NUMBER",
            placeholder: "Enter phone number...",
            description:
                "Enter a phone number with country code"
        },

        email: {
            label: "EMAIL ADDRESS",
            placeholder: "Enter email address...",
            description:
                "Enter an email address to investigate"
        },

        ip: {
            label: "IP ADDRESS",
            placeholder: "Enter IP address...",
            description:
                "Enter an IPv4 or IPv6 address"
        },

        domain: {
            label: "DOMAIN",
            placeholder: "Enter domain name...",
            description:
                "Enter a domain such as example.com"
        },

        location: {
            label: "LOCATION",
            placeholder: "Enter location...",
            description:
                "Enter a city, region or location"
        }

    };


    /* =====================================================
       YEAR
    ===================================================== */

    if (yearElement) {

        yearElement.textContent =
            new Date().getFullYear();

    }


    /* =====================================================
       TARGET BUTTONS
    ===================================================== */

    targetButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                targetButtons.forEach(btn => {

                    btn.classList.remove("active");

                });


                button.classList.add("active");


                currentTargetType =
                    button.dataset.type;


                updateTargetInterface();


                if (targetInput) {

                    targetInput.focus();

                }

            }
        );

    });


    /* =====================================================
       UPDATE TARGET INTERFACE
    ===================================================== */

    function updateTargetInterface() {

        const config =
            targetConfig[currentTargetType];


        if (!config) return;


        targetInput.placeholder =
            config.placeholder;


        targetFormat.textContent =
            config.description;


        targetInput.value = "";


        resetResults();

    }


    /* =====================================================
       ENTER KEY
    ===================================================== */

    if (targetInput) {

        targetInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    analyzeTarget();

                }

            }
        );

    }


    /* =====================================================
       ANALYZE BUTTON
    ===================================================== */

    if (investigateBtn) {

        investigateBtn.addEventListener(
            "click",
            analyzeTarget
        );

    }


    /* =====================================================
       ANALYZE TARGET
    ===================================================== */

    async function analyzeTarget() {

        const target =
            targetInput.value.trim();


        if (!target) {

            showError(
                "Please enter a target."
            );

            return;

        }


        const validation =
            validateTarget(
                target,
                currentTargetType
            );


        if (!validation.valid) {

            showError(
                validation.message
            );

            return;

        }


        const caseId =
            generateCaseId();


        caseIdElement.textContent =
            caseId;


        setScanningState();


        try {

            const data =
                await requestBackend(
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

            console.error(
                "OSINT ERROR:",
                error
            );


            showBackendError();

        }

    }


    /* =====================================================
       BACKEND REQUEST
    ===================================================== */

    async function requestBackend(
        type,
        target
    ) {

        const endpoint =
            `${BACKEND_URL}/api/${type}?target=${encodeURIComponent(target)}`;


        const response =
            await fetch(
                endpoint,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            let message =
                `Backend returned ${response.status}.`;


            try {

                const errorData =
                    await response.json();


                if (errorData.detail) {

                    message =
                        errorData.detail;

                }

            } catch (_) {}


            throw new Error(message);

        }


        return await response.json();

    }


    /* =====================================================
       DISPLAY RESULTS
    ===================================================== */

    function displayResults(
        target,
        type,
        data
    ) {

        resultsEmpty.hidden =
            true;


        resultsContent.hidden =
            false;


        resultTarget.textContent =
            target;


        resultType.textContent =
            targetConfig[type].label;


        resultStatus.textContent =
            data.status
                ? formatTitle(data.status)
                : "COMPLETED";


        if (
            type === "username" &&
            data.intelligence
        ) {

            renderUsernameResults(
                data.intelligence
            );

        } else {

            renderGenericResults(
                data
            );

        }


        setReadyState();

    }


    /* =====================================================
       USERNAME RESULTS
    ===================================================== */

    function renderUsernameResults(
        intelligence
    ) {

        dynamicResults.innerHTML = "";


        const results =
            intelligence.results || [];


        const matches =
            intelligence.possible_matches || 0;


        /*
         * SUMMARY CARD
         */

        const summaryCard =
            document.createElement("div");


        summaryCard.className =
            "result-card";


        summaryCard.innerHTML = `

            <h3>
                <i class="fa-solid fa-chart-simple"></i>
                SEARCH SUMMARY
            </h3>

            <div class="result-row">
                <span>Platforms Checked</span>
                <strong>
                    ${escapeHTML(
                        intelligence.total_platforms_checked ?? 0
                    )}
                </strong>
            </div>

            <div class="result-row">
                <span>Possible Matches</span>
                <strong>
                    ${escapeHTML(matches)}
                </strong>
            </div>

            <div class="result-row">
                <span>Identity Confirmation</span>
                <strong>
                    NOT CONFIRMED
                </strong>
            </div>

        `;


        dynamicResults.appendChild(
            summaryCard
        );


        /*
         * PLATFORM RESULTS
         */

        results.forEach(result => {

            dynamicResults.appendChild(
                createPlatformCard(result)
            );

        });

    }


    /* =====================================================
       PLATFORM CARD
    ===================================================== */

    function createPlatformCard(result) {

        const card =
            document.createElement("div");


        card.className =
            "result-card";


        const platform =
            result.platform || "Unknown";


        const status =
            result.status || "unknown";


        const url =
            result.url || "#";


        let statusText =
            formatTitle(status);


        let icon =
            "fa-circle-question";


        if (status === "possible_match") {

            statusText =
                "POSSIBLE MATCH";

            icon =
                "fa-circle-check";

        }


        if (status === "not_found") {

            statusText =
                "NOT FOUND";

            icon =
                "fa-circle-xmark";

        }


        if (status === "unavailable") {

            statusText =
                "UNAVAILABLE";

            icon =
                "fa-ban";

        }


        if (status === "timeout") {

            statusText =
                "TIMEOUT";

            icon =
                "fa-clock";

        }


        if (status === "connection_error") {

            statusText =
                "CONNECTION ERROR";

            icon =
                "fa-triangle-exclamation";

        }


        card.innerHTML = `

            <h3>

                <i class="fa-solid ${icon}"></i>

                ${escapeHTML(platform)}

            </h3>

            <div class="result-row">

                <span>Status</span>

                <strong>
                    ${escapeHTML(statusText)}
                </strong>

            </div>

            ${
                status === "possible_match"
                ?
                `
                <div class="result-row">

                    <span>Confidence</span>

                    <strong>
                        LOW
                    </strong>

                </div>

                <div class="result-row">

                    <span>Public Profile</span>

                    <strong>

                        <a
                            href="${escapeAttribute(url)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="
                                color:#536dfe;
                                text-decoration:none;
                            "
                        >
                            OPEN PROFILE
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>

                    </strong>

                </div>
                `
                :
                ""
            }

        `;


        return card;

    }


    /* =====================================================
       GENERIC RESULTS
    ===================================================== */

    function renderGenericResults(data) {

        dynamicResults.innerHTML = "";


        Object.entries(data || {})
            .forEach(([key, value]) => {

                if (
                    key === "backendReady" ||
                    value === null ||
                    value === undefined
                ) {

                    return;

                }


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "result-card";


                const title =
                    document.createElement(
                        "h3"
                    );


                title.textContent =
                    formatTitle(key);


                card.appendChild(title);


                if (
                    typeof value === "object" &&
                    !Array.isArray(value)
                ) {

                    Object.entries(value)
                        .forEach(
                            ([childKey, childValue]) => {

                                card.appendChild(
                                    createResultRow(
                                        formatTitle(childKey),
                                        childValue
                                    )
                                );

                            }
                        );

                } else {

                    card.appendChild(
                        createResultRow(
                            "Result",
                            value
                        )
                    );

                }


                dynamicResults.appendChild(
                    card
                );

            });

    }


    /* =====================================================
       RESULT ROW
    ===================================================== */

    function createResultRow(
        label,
        value
    ) {

        const row =
            document.createElement("div");


        row.className =
            "result-row";


        const labelElement =
            document.createElement("span");


        labelElement.textContent =
            label;


        const valueElement =
            document.createElement("strong");


        valueElement.textContent =
            value === null ||
            value === undefined
                ? "—"
                : String(value);


        row.appendChild(
            labelElement
        );


        row.appendChild(
            valueElement
        );


        return row;

    }


    /* =====================================================
       VALIDATION
    ===================================================== */

    function validateTarget(
        target,
        type
    ) {

        if (!target) {

            return {
                valid: false,
                message:
                    "Please enter a target."
            };

        }


        if (type === "email") {

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(target)
            ) {

                return {
                    valid: false,
                    message:
                        "Enter a valid email address."
                };

            }

        }


        if (type === "ip") {

            const ipv4Pattern =
                /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;


            if (
                !ipv4Pattern.test(target)
            ) {

                return {
                    valid: false,
                    message:
                        "Enter a valid IPv4 address."
                };

            }

        }


        if (type === "domain") {

            const domainPattern =
                /^(?!https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;


            if (
                !domainPattern.test(target)
            ) {

                return {
                    valid: false,
                    message:
                        "Enter a valid domain name."
                };

            }

        }


        return {
            valid: true
        };

    }


    /* =====================================================
       CASE ID
    ===================================================== */

    function generateCaseId() {

        const number =
            Math.floor(
                1000 +
                Math.random() * 9000
            );


        return `CASE-INT-${number}`;

    }


    /* =====================================================
       SCANNING STATE
    ===================================================== */

    function setScanningState() {

        investigateBtn.disabled =
            true;


        investigateBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            ANALYZING...
        `;


        scanStatus.innerHTML = `
            <span class="status-dot"></span>
            SCANNING
        `;


        scanStatus.style.color =
            "#b7791f";

    }


    /* =====================================================
       READY STATE
    ===================================================== */

    function setReadyState() {

        investigateBtn.disabled =
            false;


        investigateBtn.innerHTML = `
            <i class="fa-solid fa-crosshairs"></i>
            ANALYZE TARGET
        `;


        scanStatus.innerHTML = `
            <span class="status-dot"></span>
            READY
        `;


        scanStatus.style.color =
            "";

    }


    /* =====================================================
       ERROR
    ===================================================== */

    function showError(message) {

        resultsEmpty.hidden =
            false;


        resultsContent.hidden =
            true;


        resultsEmpty.innerHTML = `

            <div class="empty-icon">

                <i class="fa-solid fa-triangle-exclamation"></i>

            </div>

            <h3>
                INVALID TARGET
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        `;

    }


    /* =====================================================
       BACKEND ERROR
    ===================================================== */

    function showBackendError() {

        resultsEmpty.hidden =
            true;


        resultsContent.hidden =
            false;


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

                    <span>Server</span>

                    <strong>
                        OFFLINE / UNREACHABLE
                    </strong>

                </div>

                <p style="
                    color:#667085;
                    font-size:.78rem;
                    margin-top:12px;
                ">

                    The OSINT frontend could not connect
                    to the Python backend.

                    Make sure the FastAPI server is running
                    before starting an investigation.

                </p>

            </div>

        `;


        setReadyState();

    }


    /* =====================================================
       RESET
    ===================================================== */

    function resetResults() {

        resultsEmpty.hidden =
            false;


        resultsContent.hidden =
            true;


        resultsEmpty.innerHTML = `

            <div class="empty-icon">

                <i class="fa-solid fa-radar"></i>

            </div>

            <h3>
                Awaiting Target
            </h3>

            <p>
                Enter a target above and initiate
                an analysis to begin the investigation.
            </p>

        `;


        scanStatus.innerHTML = `
            <span class="status-dot"></span>
            READY
        `;


        scanStatus.style.color =
            "";

    }


    /* =====================================================
       HISTORY
    ===================================================== */

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


    function saveInvestigation(
        target,
        type,
        caseId
    ) {

        const history =
            getHistory();


        history.unshift({

            target,
            type,
            caseId,

            timestamp:
                new Date().toLocaleString()

        });


        localStorage.setItem(
            "intelligence_osint_history",

            JSON.stringify(
                history.slice(0, 10)
            )
        );


        renderHistory();

    }


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

            const element =
                document.createElement("div");


            element.className =
                "history-item";


            element.innerHTML = `

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
                element
            );

        });

    }


    /* =====================================================
       CLEAR HISTORY
    ===================================================== */

    if (clearHistoryBtn) {

        clearHistoryBtn.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "intelligence_osint_history"
                );


                renderHistory();

            }
        );

    }


    /* =====================================================
       SECURITY HELPERS
    ===================================================== */

    function escapeHTML(value) {

        const div =
            document.createElement("div");


        div.textContent =
            String(value);


        return div.innerHTML;

    }


    function escapeAttribute(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }


    function formatTitle(value) {

        return String(value)
            .replace(/[_-]/g, " ")
            .replace(
                /\b\w/g,
                letter =>
                    letter.toUpperCase()
            );

    }


    /* =====================================================
       CURSOR EFFECT
    ===================================================== */

    const cursorGlow =
        document.querySelector(
            ".cursor-glow"
        );


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


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateTargetInterface();

    renderHistory();

});