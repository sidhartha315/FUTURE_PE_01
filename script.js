"use strict";

/* =========================================
   GLOW STUDIO
   Navigation, booking and website behaviour
========================================= */


/*
IMPORTANT:
Replace the placeholder below with the real
Glow Studio WhatsApp number before using it.

Format:
India country code + number, digits only.

Example format: 919876543210

Do not include +, spaces or hyphens.
*/
const SALON_WHATSAPP_NUMBER = "91XXXXXXXXXX";


/* 1. Mobile Navigation */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

function closeMobileMenu() {
    if (!menuToggle || !navLinks) {
        return;
    }

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    navLinks.classList.remove("is-open");
}

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
        const isOpen =
            menuToggle.getAttribute("aria-expanded") === "true";

        menuToggle.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );

        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Open navigation menu" : "Close navigation menu"
        );

        navLinks.classList.toggle("is-open", !isOpen);
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMobileMenu();
        }
    });

    document.addEventListener("click", function (event) {
        const clickedInsideMenu = navLinks.contains(event.target);
        const clickedToggle = menuToggle.contains(event.target);

        if (!clickedInsideMenu && !clickedToggle) {
            closeMobileMenu();
        }
    });
}


/* 2. Automatically Update Footer Year */

const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


/* 3. Set the Earliest Booking Date to Today */

const appointmentDate = document.getElementById("appointmentDate");

function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

if (appointmentDate) {
    const today = getLocalDateString(new Date());

    appointmentDate.min = today;
    appointmentDate.value = today;
}


/* 4. Select a Service from a Service Card */

const serviceLinks = document.querySelectorAll("[data-service]");
const serviceSelect = document.getElementById("serviceSelect");

serviceLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        const selectedService = link.dataset.service;

        if (serviceSelect && selectedService) {
            serviceSelect.value = selectedService;
        }
    });
});


/* 5. Booking Form */

const bookingForm = document.getElementById("bookingForm");
const formStatus = document.getElementById("formStatus");

function showFormMessage(message, isError = false) {
    if (!formStatus) {
        return;
    }

    formStatus.textContent = message;
    formStatus.style.color = isError ? "#a12626" : "#47764c";
}

if (bookingForm) {
    bookingForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!bookingForm.reportValidity()) {
            return;
        }

        const name = document
            .getElementById("customerName")
            .value
            .trim();

        const phone = document
            .getElementById("customerPhone")
            .value
            .trim();

        const service = serviceSelect.value;

        const date = appointmentDate.value;

        const time = document
            .getElementById("appointmentTime")
            .value;

        const message = document
            .getElementById("customerMessage")
            .value
            .trim();

        if (!name || !phone || !service || !date || !time) {
            showFormMessage(
                "Please complete all required fields.",
                true
            );

            return;
        }

        /*
        A date field can be edited manually in some browsers.
        Validate that the chosen date is not in the past.
        */
        const selectedDate = new Date(`${date}T00:00:00`);
        const currentDate = new Date(
            `${getLocalDateString(new Date())}T00:00:00`
        );

        if (selectedDate < currentDate) {
            showFormMessage(
                "Please select today or a future date.",
                true
            );

            appointmentDate.focus();
            return;
        }

        /*
        Prepare a WhatsApp booking request.
        This is a request, not an automatically confirmed booking.
        */

        const bookingMessage = [
            "Hello Glow Studio!",
            "",
            "I would like to enquire about an appointment.",
            "",
            `Name: ${name}`,
            `Phone: ${phone}`,
            `Service: ${service}`,
            `Preferred date: ${date}`,
            `Preferred time: ${time}`,
            message ? `Additional message: ${message}` : "",
            "",
            "Please let me know if this appointment is available."
        ]
            .filter(Boolean)
            .join("\n");

        const isConfigured =
            /^\d{10,15}$/.test(SALON_WHATSAPP_NUMBER) &&
            !SALON_WHATSAPP_NUMBER.includes("X");

        if (!isConfigured) {
            /*
            The form still works for local testing.
            Configure the salon's real WhatsApp number
            to enable the actual WhatsApp handoff.
            */

            showFormMessage(
                "Your form is working! To send this request through WhatsApp, add the salon's real WhatsApp number in script.js."
            );

            console.info("Booking request prepared:", {
                name,
                phone,
                service,
                date,
                time,
                message
            });

            return;
        }

        const whatsappURL =
            `https://wa.me/${SALON_WHATSAPP_NUMBER}` +
            `?text=${encodeURIComponent(bookingMessage)}`;

        showFormMessage(
            "Opening WhatsApp to send your appointment request..."
        );

        window.open(
            whatsappURL,
            "_blank",
            "noopener,noreferrer"
        );
    });
}


/* 6. Image Fallback */

document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
        image.classList.add("image-unavailable");

        /*
        Keep the layout intact if an external image fails.
        The CSS provides a soft background instead of a
        broken-image visual.
        */
    });
});


/* 7. Console Confirmation */

console.info(
    "Glow Studio website loaded successfully."
);

